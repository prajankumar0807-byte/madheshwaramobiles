import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, X } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";

const WA = "https://wa.me/918124995343";
const INSTA = "https://www.instagram.com/madheshwara.mobiles?igsh=d2c4OTFhdndzNmxh";
const MAPS = "https://maps.app.goo.gl/teuc6oYxZihVf3vH6";
const TEL = "tel:+918124995343";
const REVIEW = "https://www.google.com/search?q=sri+madheshwara+mobiles+krishnagiri+mathur+reviews";

type Cmd = {
  match: (t: string) => boolean;
  run: () => void;
  label: { en: string; ta: string };
};

const has = (t: string, words: string[]) => words.some((w) => t.includes(w));
const scrollTo = (id: string) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
};

const commands: Cmd[] = [
  { label: { en: "Go to top / home", ta: "மேலே / முகப்பு" },
    match: (t) => has(t, ["home", "top", "முகப்பு", "மேலே"]),
    run: () => scrollTo("top") },
  { label: { en: "About", ta: "எங்களை பற்றி" },
    match: (t) => has(t, ["about", "story", "எங்களை", "கதை"]),
    run: () => scrollTo("about") },
  { label: { en: "Brands", ta: "பிராண்டுகள்" },
    match: (t) => has(t, ["brand", "oppo", "vivo", "redmi", "realme", "பிராண்ட"]),
    run: () => scrollTo("brands") },
  { label: { en: "Accessories", ta: "துணை பொருட்கள்" },
    match: (t) => has(t, ["accessor", "charger", "cable", "watch", "battery", "துணை", "சார்ஜர்", "பேட்டரி"]),
    run: () => scrollTo("accessories") },
  { label: { en: "Services / Repair", ta: "சேவைகள் / பழுது" },
    match: (t) => has(t, ["service", "repair", "fix", "சேவை", "பழுது", "ரிப்பேர்"]),
    run: () => scrollTo("services") },
  { label: { en: "Gallery / Shop", ta: "கேலரி / கடை" },
    match: (t) => has(t, ["gallery", "shop", "showroom", "கேலரி", "கடை", "ஷோரூம்"]),
    run: () => scrollTo("gallery") },
  { label: { en: "Contact", ta: "தொடர்பு" },
    match: (t) => has(t, ["contact", "reach", "தொடர்பு"]),
    run: () => scrollTo("contact") },
  { label: { en: "Call the shop", ta: "கடையை அழை" },
    match: (t) => has(t, ["call", "phone", "dial", "அழை", "போன்", "கால்"]),
    run: () => { window.location.href = TEL; } },
  { label: { en: "Open WhatsApp", ta: "வாட்ஸ்அப்" },
    match: (t) => has(t, ["whatsapp", "whats app", "வாட்ஸ்"]),
    run: () => window.open(WA, "_blank") },
  { label: { en: "Open Instagram", ta: "இன்ஸ்டாகிராம்" },
    match: (t) => has(t, ["instagram", "insta", "இன்ஸ்டா"]),
    run: () => window.open(INSTA, "_blank") },
  { label: { en: "Directions / Map", ta: "வழிகாட்டுதல்" },
    match: (t) => has(t, ["direction", "map", "location", "வழி", "மேப்", "இடம்"]),
    run: () => window.open(MAPS, "_blank") },
  { label: { en: "Write a review", ta: "மதிப்பீடு எழுது" },
    match: (t) => has(t, ["review", "rating", "rate", "மதிப்பீ", "ரேட்"]),
    run: () => window.open(REVIEW, "_blank") },
];

export const VoiceCommandFab = () => {
  const { lang, t: tr } = useI18n();
  const [open, setOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [heard, setHeard] = useState("");
  const [supported, setSupported] = useState(true);
  const recRef = useRef<any>(null);

  useEffect(() => {
    const SR = (typeof window !== "undefined")
      ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      : null;
    if (!SR) { setSupported(false); return; }
    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = true;
    rec.maxAlternatives = 3;
    rec.lang = lang === "ta" ? "ta-IN" : "en-IN";
    rec.onresult = (e: any) => {
      let txt = "";
      for (let i = e.resultIndex; i < e.results.length; i++) txt += e.results[i][0].transcript;
      setHeard(txt);
      const final = e.results[e.results.length - 1].isFinal;
      if (final) {
        const norm = txt.toLowerCase().trim();
        const cmd = commands.find((c) => c.match(norm));
        if (cmd) {
          toast.success((lang === "ta" ? "செயல்: " : "Action: ") + cmd.label[lang]);
          cmd.run();
          setOpen(false);
        } else {
          toast.error(lang === "ta" ? "கட்டளை புரியவில்லை" : "Command not recognized");
        }
        setListening(false);
      }
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec;
    return () => { try { rec.abort(); } catch {} };
  }, [lang]);

  const start = () => {
    if (!recRef.current) return;
    setHeard("");
    try {
      recRef.current.start();
      setListening(true);
    } catch {}
  };
  const stop = () => { try { recRef.current?.stop(); } catch {}; setListening(false); };

  if (!supported) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Voice commands"
        className="fixed bottom-44 right-6 z-50 group"
      >
        <div className="absolute inset-0 rounded-full gradient-gold-bg blur-xl opacity-60 animate-pulse-glow" />
        <div className="relative h-14 w-14 rounded-full glass-card gold-border flex items-center justify-center shadow-gold transition-transform group-hover:scale-110">
          <Mic className="h-6 w-6 text-gold" />
        </div>
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 bg-background/70 backdrop-blur-md" onClick={() => { stop(); setOpen(false); }}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md glass-card rounded-3xl border border-[color:var(--gold)]/40 p-6 shadow-gold animate-rise">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="font-display text-lg gradient-gold-text">
                  {lang === "ta" ? "குரல் கட்டளை" : "Voice Command"}
                </div>
                <div className="text-[10px] tracking-widest text-muted-foreground">
                  {lang === "ta" ? "தமிழ் / ENGLISH" : "ENGLISH / தமிழ்"}
                </div>
              </div>
              <button onClick={() => { stop(); setOpen(false); }} className="text-muted-foreground hover:text-gold">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-col items-center py-6">
              <button
                onClick={listening ? stop : start}
                className={`relative h-24 w-24 rounded-full flex items-center justify-center transition ${listening ? "bg-red-500/20 border-2 border-red-500" : "gradient-gold-bg shadow-gold"}`}
              >
                {listening && <span className="absolute inset-0 rounded-full border-2 border-red-500 animate-ping" />}
                {listening ? <MicOff className="h-10 w-10 text-red-400" /> : <Mic className="h-10 w-10 text-background" />}
              </button>
              <p className="mt-4 text-sm text-center text-muted-foreground min-h-[2.5rem]">
                {listening
                  ? (lang === "ta" ? "கேட்கிறேன்… பேசுங்கள்" : "Listening… speak now")
                  : (lang === "ta" ? "மைக்கை அழுத்தி பேசுங்கள்" : "Tap the mic and speak")}
              </p>
              {heard && (
                <p className="mt-2 text-sm gradient-gold-text font-medium text-center">"{heard}"</p>
              )}
            </div>

            <div className="border-t border-[color:var(--gold)]/20 pt-4">
              <div className="text-[10px] tracking-widest text-muted-foreground mb-2">
                {lang === "ta" ? "எடுத்துக்காட்டு கட்டளைகள்" : "TRY SAYING"}
              </div>
              <div className="flex flex-wrap gap-2">
                {commands.slice(0, 8).map((c, i) => (
                  <span key={i} className="text-xs px-2.5 py-1 rounded-full glass border border-[color:var(--gold)]/20 text-foreground/80">
                    {c.label[lang]}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
