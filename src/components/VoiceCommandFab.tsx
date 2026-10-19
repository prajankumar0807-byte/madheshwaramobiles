import { useEffect, useRef, useState, useCallback } from "react";
import { Mic, MicOff, X, Check, ShieldCheck, Radio, Search, AlertCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";
import type { Lang } from "@/lib/voice-commands";
import {
  COMMANDS, matchCommand, topSuggestions, URLS,
  type Command,
} from "@/lib/voice-commands";

const HANDS_FREE_WINDOW_MS = 15000; // keep mic open 15s after tap in hands-free mode
const PERM_KEY = "smm-voice-enabled";
const HANDS_FREE_KEY = "smm-voice-handsfree";
const VOICE_LANG_KEY = "smm-voice-language";

const runCommand = (cmd: Command) => {
  switch (cmd.kind) {
    case "navigate": {
      const el = cmd.section ? document.getElementById(cmd.section) : null;
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      break;
    }
    case "call": window.location.href = URLS.tel; break;
    case "whatsapp": window.open(URLS.wa, "_blank"); break;
    case "instagram": window.open(URLS.insta, "_blank"); break;
    case "directions": window.open(URLS.maps, "_blank"); break;
    case "review": window.open(URLS.review, "_blank"); break;
    case "cancel": break;
  }
};

type PermState = "unknown" | "granted" | "denied" | "disabled" | "unavailable";

export const VoiceCommandFab = () => {
  const { lang } = useI18n();
  const [open, setOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [handsFree, setHandsFree] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [voiceLang, setVoiceLang] = useState<Lang>(lang);
  const [perm, setPerm] = useState<PermState>("unknown");
  const [supported, setSupported] = useState(true);
  const [interim, setInterim] = useState("");
  const [finalT, setFinalT] = useState("");
  const [pending, setPending] = useState<{ cmd: Command; suggestions: Command[] } | null>(null);
  const [showPrivacy, setShowPrivacy] = useState(false);

  const recRef = useRef<any>(null);
  const handsFreeTimer = useRef<number | null>(null);
  const restartOnEnd = useRef(false);

  // Load persisted prefs
  useEffect(() => {
    if (typeof window === "undefined") return;
    const dis = localStorage.getItem(PERM_KEY);
    if (dis === "0") { setEnabled(false); setPerm("disabled"); }
    const hf = localStorage.getItem(HANDS_FREE_KEY);
    if (hf === "1") setHandsFree(true);
    const savedLang = localStorage.getItem(VOICE_LANG_KEY);
    const siteLang = localStorage.getItem("lang");
    const detectedLang = navigator.language.toLowerCase().startsWith("ta") ? "ta" : "en";
    const preferredLang = savedLang === "en" || savedLang === "ta"
      ? savedLang
      : siteLang === "en" || siteLang === "ta" ? siteLang : detectedLang;
    setVoiceLang(preferredLang);
    localStorage.setItem(VOICE_LANG_KEY, preferredLang);
  }, []);

  // Build recognizer
  useEffect(() => {
    if (typeof window === "undefined") return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { setSupported(false); return; }
    const rec = new SR();
    rec.continuous = handsFree;
    rec.interimResults = true;
    rec.maxAlternatives = 3;
    rec.lang = voiceLang === "ta" ? "ta-IN" : "en-IN";

    rec.onstart = () => setListening(true);
    rec.onresult = (e: any) => {
      let intr = "";
      let fin = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) fin += r[0].transcript;
        else intr += r[0].transcript;
      }
      if (intr) setInterim(intr);
      if (fin) {
        setInterim("");
        setFinalT(fin);
        const cmd = matchCommand(fin);
        const suggestions = topSuggestions(fin, 3);
        if (cmd) {
          setPending({ cmd, suggestions });
        } else if (suggestions.length) {
          setPending({ cmd: suggestions[0], suggestions });
        } else {
          toast.error(lang === "ta" ? "கட்டளை புரியவில்லை — மீண்டும் முயற்சி" : "Didn't catch that — try again");
        }
      }
    };
    rec.onerror = (e: any) => {
      restartOnEnd.current = false;
      setListening(false);
      if (e?.error === "not-allowed" || e?.error === "service-not-allowed") {
        setPerm("denied");
        toast.error(lang === "ta" ? "மைக் அனுமதி மறுக்கப்பட்டது" : "Microphone permission blocked");
      } else if (e?.error === "no-speech") {
        // ignore silently
      }
    };
    rec.onend = () => {
      setListening(false);
      // Hands-free: auto-restart until window elapses or user cancels
      if (restartOnEnd.current && handsFree && enabled) {
        try { rec.start(); } catch {}
      }
    };
    recRef.current = rec;
    return () => {
      restartOnEnd.current = false;
      try { rec.abort(); } catch {}
    };
  }, [voiceLang, handsFree, enabled]);

  // Track permission where available
  useEffect(() => {
    const nav: any = typeof navigator !== "undefined" ? navigator : null;
    if (!nav?.permissions?.query) return;
    nav.permissions.query({ name: "microphone" as PermissionName }).then((res: any) => {
      if (!enabled) return;
      setPerm(res.state === "prompt" ? "unknown" : (res.state as PermState));
      res.onchange = () => setPerm(res.state === "prompt" ? "unknown" : res.state as PermState);
    }).catch(() => {});
  }, [enabled]);

  const clearHandsFreeTimer = () => {
    if (handsFreeTimer.current !== null) {
      window.clearTimeout(handsFreeTimer.current);
      handsFreeTimer.current = null;
    }
  };

  const stop = useCallback(() => {
    restartOnEnd.current = false;
    clearHandsFreeTimer();
    try { recRef.current?.stop(); } catch {}
    setListening(false);
  }, []);

  const requestMic = useCallback(async () => {
    const nav: any = typeof navigator !== "undefined" ? navigator : null;
    if (!nav?.mediaDevices?.getUserMedia) {
      setPerm("unavailable");
      return false;
    }
    try {
      const stream = await nav.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t: MediaStreamTrack) => t.stop());
      setPerm("granted");
      return true;
    } catch {
      setPerm("denied");
      toast.error(lang === "ta" ? "மைக் அனுமதி தேவை" : "Microphone permission is needed");
      return false;
    }
  }, [lang]);

  const start = useCallback(async () => {
    if (!enabled) {
      toast.error(lang === "ta" ? "குரல் முடக்கப்பட்டுள்ளது" : "Voice is disabled");
      return;
    }
    if (!recRef.current) return;
    const ok = await requestMic();
    if (!ok) return;
    setInterim(""); setFinalT(""); setPending(null);
    restartOnEnd.current = handsFree;
    try {
      recRef.current.start();
    } catch {
      // already started
    }
    if (handsFree) {
      clearHandsFreeTimer();
      handsFreeTimer.current = window.setTimeout(() => {
        stop();
        toast.message(lang === "ta" ? "கேட்பது நிறுத்தப்பட்டது" : "Listening stopped");
      }, HANDS_FREE_WINDOW_MS);
    }
  }, [enabled, handsFree, lang, stop, requestMic]);

  const confirmPending = () => {
    if (!pending) return;
    toast.success((lang === "ta" ? "செயல்: " : "Action: ") + pending.cmd.label[lang]);
    runCommand(pending.cmd);
    setPending(null);
    setFinalT("");
    if (!handsFree) setOpen(false);
  };

  const cancelPending = () => {
    setPending(null);
    setFinalT("");
    setInterim("");
  };

  const toggleEnabled = () => {
    const next = !enabled;
    setEnabled(next);
    localStorage.setItem(PERM_KEY, next ? "1" : "0");
    if (!next) { stop(); setPerm("disabled"); toast.message(lang === "ta" ? "குரல் முடக்கப்பட்டது" : "Voice disabled"); }
    else { setPerm("unknown"); toast.success(lang === "ta" ? "குரல் இயக்கப்பட்டது" : "Voice enabled"); }
  };

  const toggleHandsFree = () => {
    const next = !handsFree;
    setHandsFree(next);
    localStorage.setItem(HANDS_FREE_KEY, next ? "1" : "0");
    if (!next) stop();
  };

  const chooseVoiceLanguage = (next: Lang) => {
    setVoiceLang(next);
    localStorage.setItem(VOICE_LANG_KEY, next);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label={supported ? "Voice commands" : (lang === "ta" ? "குரல் தேடல் கிடைக்கவில்லை" : "Voice search unavailable")}
        data-testid="voice-fab"
        disabled={!supported}
        title={!supported ? (lang === "ta" ? "இந்த உலாவி குரல் தேடலை ஆதரிக்கவில்லை" : "Voice search is not supported by this browser") : undefined}
        className="fixed bottom-44 right-6 z-50 group disabled:cursor-not-allowed disabled:opacity-50"
      >
        <div className="absolute inset-0 rounded-full gradient-gold-bg blur-xl opacity-60 animate-pulse-glow" />
        <div className="relative h-14 w-14 rounded-full glass-card gold-border flex items-center justify-center shadow-gold transition-transform group-hover:scale-110">
          {supported ? <Mic className="h-6 w-6 text-gold" /> : <AlertCircle className="h-6 w-6 text-muted-foreground" />}
        </div>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 bg-background/70 backdrop-blur-md"
          onClick={() => { stop(); setOpen(false); }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md glass-card rounded-3xl border border-[color:var(--gold)]/40 p-5 sm:p-6 shadow-gold animate-rise max-h-[92svh] overflow-y-auto"
            role="dialog" aria-label="Voice command"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="font-display text-lg gradient-gold-text flex items-center gap-2">
                  {lang === "ta" ? "குரல் கட்டளை" : "Voice Command"}
                  {handsFree && (
                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-[color:var(--gold)]/20 text-gold">
                      <Radio className="h-3 w-3" /> {lang === "ta" ? "நேரடி" : "HANDS-FREE"}
                    </span>
                  )}
                </div>
                <div className="text-[10px] tracking-widest text-muted-foreground">
                  {lang === "ta" ? "தமிழ் / ENGLISH" : "ENGLISH / தமிழ்"}
                </div>
              </div>
              <button onClick={() => { stop(); setOpen(false); }} className="text-muted-foreground hover:text-gold" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Toggles */}
            <div className="flex flex-wrap gap-2 mb-4 text-xs">
              <div className="inline-flex items-center rounded-full border border-[color:var(--gold)]/20 p-0.5" aria-label={lang === "ta" ? "குரல் மொழி" : "Voice search language"}>
                {(["en", "ta"] as const).map((choice) => (
                  <button
                    key={choice}
                    type="button"
                    onClick={() => chooseVoiceLanguage(choice)}
                    aria-pressed={voiceLang === choice}
                    className={`rounded-full px-2.5 py-1 transition ${voiceLang === choice ? "gradient-gold-bg text-background" : "text-muted-foreground"}`}
                  >{choice === "en" ? "EN" : "தமிழ்"}</button>
                ))}
              </div>
              <button
                onClick={toggleHandsFree}
                className={`px-3 py-1.5 rounded-full border transition ${handsFree ? "bg-[color:var(--gold)]/20 border-[color:var(--gold)] text-gold" : "border-[color:var(--gold)]/20 text-muted-foreground"}`}
                aria-pressed={handsFree}
              >
                <Radio className="inline h-3 w-3 mr-1" />
                {lang === "ta" ? "நேரடி பயன்முறை" : "Hands-free"}
              </button>
              <button
                onClick={toggleEnabled}
                className={`px-3 py-1.5 rounded-full border transition ${enabled ? "border-[color:var(--gold)]/20 text-muted-foreground" : "bg-red-500/20 border-red-500 text-red-300"}`}
                aria-pressed={!enabled}
              >
                {enabled
                  ? (lang === "ta" ? "🎙 குரல் இயக்கத்தில்" : "🎙 Voice on")
                  : (lang === "ta" ? "🚫 குரல் அணைந்துள்ளது" : "🚫 Voice off")}
              </button>
              <button
                onClick={() => setShowPrivacy((s) => !s)}
                className="px-3 py-1.5 rounded-full border border-[color:var(--gold)]/20 text-muted-foreground"
              >
                <ShieldCheck className="inline h-3 w-3 mr-1" />
                {lang === "ta" ? "தனியுரிமை" : "Privacy"}
              </button>
            </div>

            {/* Privacy note */}
            {showPrivacy && (
              <div className="mb-4 text-xs text-muted-foreground rounded-2xl border border-[color:var(--gold)]/20 p-3 bg-background/40 leading-relaxed">
                {lang === "ta"
                  ? "உங்கள் குரல் உங்கள் உலாவியில் மட்டுமே செயலாக்கப்படுகிறது (Web Speech API). எந்த ஆடியோவும் எங்கள் சேவையகங்களுக்கு அனுப்பப்படுவதோ சேமிக்கப்படுவதோ இல்லை. நீங்கள் எப்போது வேண்டுமானாலும் மேலே உள்ள 'குரல் அணை' பொத்தானை அழுத்தி இதை நிறுத்தலாம்."
                  : "Your voice is processed entirely in your browser via the Web Speech API. No audio is sent to or stored on our servers. You can turn voice off any time with the toggle above; the setting is remembered on this device."}
              </div>
            )}

            {/* Permission and browser availability guidance */}
            {(perm === "denied" || perm === "unavailable" || !supported) && (
              <div className="mb-4 rounded-2xl border border-destructive/40 bg-destructive/10 p-3 text-xs text-foreground" role="alert">
                <div className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                  <div>
                    <p className="font-semibold">{lang === "ta" ? "மைக் அனுமதி அல்லது ஆதரவு தேவை" : "Microphone access is unavailable"}</p>
                    <p className="mt-1 text-muted-foreground">
                      {perm === "unavailable" || !supported
                        ? (lang === "ta" ? "இந்த உலாவி குரல் தேடலை ஆதரிக்கவில்லை. மைக் மற்றும் குரல் தேடலை ஆதரிக்கும் புதுப்பிக்கப்பட்ட உலாவியைப் பயன்படுத்தவும்." : "This browser does not provide microphone or speech-recognition support. Try an up-to-date browser with microphone access over HTTPS.")
                        : (lang === "ta" ? "உலாவி முகவரிப் பட்டியில் உள்ள தள அமைப்புகளைத் திறந்து, இந்த தளத்திற்கு மைக் அனுமதி வழங்கி மீண்டும் முயற்சிக்கவும்." : "Open this site's browser permissions from the address bar, allow microphone access, then try again.")}
                    </p>
                    {perm === "denied" && supported && (
                      <button type="button" onClick={() => { void requestMic(); }} className="mt-2 rounded-lg border border-[color:var(--gold)]/30 px-3 py-1.5 text-gold">
                        {lang === "ta" ? "அனுமதியை மீண்டும் சரிபார்" : "Check permission again"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Mic button */}
            <div className="flex flex-col items-center py-4">
              <button
                onClick={listening ? stop : start}
                disabled={!enabled || perm === "denied" || perm === "unavailable" || !supported}
                data-testid="voice-mic"
                className={`relative h-24 w-24 rounded-full flex items-center justify-center transition disabled:opacity-40 ${listening ? "bg-red-500/20 border-2 border-red-500" : "gradient-gold-bg shadow-gold"}`}
                aria-label={listening ? "Stop listening" : "Start listening"}
              >
                {listening && <span className="absolute inset-0 rounded-full border-2 border-red-500 animate-ping" />}
                {listening
                  ? <MicOff className="h-10 w-10 text-red-400" />
                  : <Mic className="h-10 w-10 text-background" />}
              </button>
              <p className="mt-3 text-sm text-center text-muted-foreground min-h-[1.25rem]">
                {!enabled
                  ? (lang === "ta" ? "குரல் அணைந்துள்ளது" : "Voice is off")
                  : listening
                    ? (handsFree
                        ? (lang === "ta" ? `கேட்கிறேன் — ${HANDS_FREE_WINDOW_MS/1000}வி நேரடி` : `Listening — hands-free ${HANDS_FREE_WINDOW_MS/1000}s`)
                        : (lang === "ta" ? "கேட்கிறேன்… பேசுங்கள்" : "Listening… speak now"))
                    : perm === "denied"
                      ? (lang === "ta" ? "மைக் அனுமதியை இயக்கவும்" : "Enable microphone permission to continue")
                      : perm === "unavailable" || !supported
                        ? (lang === "ta" ? "இந்த உலாவியில் மைக் கிடைக்கவில்லை" : "Microphone is unavailable in this browser")
                        : (lang === "ta" ? "மைக்கை அழுத்தி பேசுங்கள்" : "Tap the mic and speak")}
              </p>
            </div>

            {/* Live transcript */}
            {(interim || finalT) && (
              <div className="mt-2 mb-3 rounded-2xl border border-[color:var(--gold)]/30 bg-background/40 p-3" data-testid="voice-transcript">
                <div className="text-[10px] tracking-widest text-muted-foreground mb-1">
                  {lang === "ta" ? "நேரடி எழுத்து" : "LIVE TRANSCRIPT"}
                </div>
                <p className="text-sm">
                  {finalT && <span className="gradient-gold-text font-medium">{finalT} </span>}
                  {interim && <span className="text-muted-foreground italic">{interim}</span>}
                </p>
              </div>
            )}

            {/* Confirmation card */}
            {pending && (
              <div className="mt-2 rounded-2xl border border-[color:var(--gold)]/40 bg-background/60 p-4 space-y-3" data-testid="voice-confirm">
                <div>
                  <div className="text-[10px] tracking-widest text-muted-foreground mb-1">
                    {lang === "ta" ? "இதை உறுதிசெய்" : "CONFIRM ACTION"}
                  </div>
                  <div className="font-semibold gradient-gold-text">{pending.cmd.label[lang]}</div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={confirmPending}
                    data-testid="voice-confirm-yes"
                    className="flex-1 inline-flex items-center justify-center gap-1 rounded-full gradient-gold-bg text-background text-sm font-semibold py-2 shadow-gold"
                  >
                    <Check className="h-4 w-4" /> {lang === "ta" ? "ஆம், செய்" : "Yes, do it"}
                  </button>
                  <button
                    onClick={cancelPending}
                    className="flex-1 rounded-full border border-[color:var(--gold)]/30 text-sm py-2 hover:bg-[color:var(--gold)]/10"
                  >
                    {lang === "ta" ? "ரத்து" : "Cancel"}
                  </button>
                </div>
                {pending.suggestions.length > 1 && (
                  <div>
                    <div className="text-[10px] tracking-widest text-muted-foreground mb-1">
                      {lang === "ta" ? "இதை நினைத்தீர்களா?" : "OR DID YOU MEAN"}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {pending.suggestions.filter((s) => s.id !== pending.cmd.id).map((s) => (
                        <button
                          key={s.id}
                          onClick={() => setPending({ cmd: s, suggestions: pending.suggestions })}
                          className="text-xs px-2.5 py-1 rounded-full glass border border-[color:var(--gold)]/20 hover:border-[color:var(--gold)]"
                        >
                          {s.label[lang]}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Try saying */}
            {!pending && (
              <div className="mt-4 border-t border-[color:var(--gold)]/20 pt-4">
                <div className="text-[10px] tracking-widest text-muted-foreground mb-2 flex items-center gap-1">
                  <Search className="h-3 w-3" /> {lang === "ta" ? "எடுத்துக்காட்டுகள்" : "TRY SAYING"}
                </div>
                <div className="flex flex-wrap gap-2">
                  {COMMANDS.filter((c) => c.kind !== "cancel").slice(0, 9).map((c) => (
                    <span key={c.id} className="text-xs px-2.5 py-1 rounded-full glass border border-[color:var(--gold)]/20 text-foreground/80">
                      {c.label[lang]}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
