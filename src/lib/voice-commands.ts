// Pure, framework-free voice command matcher for SMM website.
// Imported by src/components/VoiceCommandFab.tsx AND scripts/test-voice-commands.mjs

export type Lang = "en" | "ta";

export type CommandKind =
  | "navigate"
  | "call"
  | "whatsapp"
  | "instagram"
  | "directions"
  | "review"
  | "cancel";

export type Command = {
  id: string;
  kind: CommandKind;
  section?: string; // dom id to scroll to
  url?: string;
  label: { en: string; ta: string };
  keywords: string[]; // lowercased english + tamil tokens
};

export const URLS = {
  wa: "https://wa.me/918124995343",
  insta: "https://www.instagram.com/madheshwara.mobiles?igsh=d2c4OTFhdndzNmxh",
  maps: "https://maps.app.goo.gl/teuc6oYxZihVf3vH6",
  tel: "tel:+918124995343",
  review: "https://www.google.com/search?q=sri+madheshwara+mobiles+krishnagiri+mathur+reviews",
};

export const COMMANDS: Command[] = [
  { id: "home", kind: "navigate", section: "top",
    label: { en: "Home", ta: "முகப்பு" },
    keywords: ["home", "top", "start", "முகப்பு", "மேலே", "ஆரம்பம்"] },
  { id: "about", kind: "navigate", section: "about",
    label: { en: "About us", ta: "எங்களை பற்றி" },
    keywords: ["about", "story", "who", "எங்களை", "கதை", "பற்றி"] },
  { id: "brands", kind: "navigate", section: "brands",
    label: { en: "Brands", ta: "பிராண்டுகள்" },
    keywords: ["brand", "brands", "oppo", "vivo", "redmi", "realme", "xiaomi", "samsung",
      "phone", "smartphone", "mobile", "பிராண்ட", "மொபைல்", "போன்", "ஸ்மார்ட்"] },
  { id: "accessories", kind: "navigate", section: "accessories",
    label: { en: "Accessories", ta: "துணை பொருட்கள்" },
    keywords: ["accessor", "charger", "cable", "watch", "battery", "earbud", "headphone",
      "speaker", "powerbank", "power bank", "memory", "pendrive", "glass", "otg", "type c",
      "துணை", "சார்ஜர்", "பேட்டரி", "ஈர்பட்", "ஸ்பீக்கர்", "மெமரி", "பென்ட்ரைவ்"] },
  { id: "services", kind: "navigate", section: "services",
    label: { en: "Services & Repair", ta: "சேவைகள் & பழுது" },
    keywords: ["service", "services", "repair", "fix", "display", "mic", "screen",
      "charging port", "சேவை", "பழுது", "ரிப்பேர்", "டிஸ்ப்ளே", "மைக்"] },
  { id: "gallery", kind: "navigate", section: "gallery",
    label: { en: "Gallery / Shop", ta: "கேலரி / கடை" },
    keywords: ["gallery", "shop", "showroom", "store", "photo",
      "கேலரி", "கடை", "ஷோரூம்", "ஸ்டோர்"] },
  { id: "contact", kind: "navigate", section: "contact",
    label: { en: "Contact", ta: "தொடர்பு" },
    keywords: ["contact", "reach", "address", "hours", "தொடர்பு", "முகவரி"] },

  { id: "call", kind: "call", url: URLS.tel,
    label: { en: "Call the shop", ta: "கடையை அழை" },
    keywords: ["call", "phone", "dial", "ring", "அழை", "கால்", "போன்"] },
  { id: "whatsapp", kind: "whatsapp", url: URLS.wa,
    label: { en: "Open WhatsApp", ta: "வாட்ஸ்அப் திற" },
    keywords: ["whatsapp", "whats app", "message", "chat on whatsapp", "வாட்ஸ்"] },
  { id: "instagram", kind: "instagram", url: URLS.insta,
    label: { en: "Open Instagram", ta: "இன்ஸ்டாகிராம் திற" },
    keywords: ["instagram", "insta", "இன்ஸ்டா"] },
  { id: "directions", kind: "directions", url: URLS.maps,
    label: { en: "Get directions", ta: "வழிகாட்டுதல்" },
    keywords: ["direction", "directions", "map", "maps", "location", "navigate to shop",
      "வழி", "மேப்", "இடம்", "லொகேஷன்"] },
  { id: "review", kind: "review", url: URLS.review,
    label: { en: "Write a review", ta: "மதிப்பீடு எழுது" },
    keywords: ["review", "rating", "rate", "google review", "star",
      "மதிப்பீ", "ரேட்", "நட்சத்திர"] },

  { id: "cancel", kind: "cancel",
    label: { en: "Cancel", ta: "ரத்து செய்" },
    keywords: ["cancel", "stop", "never mind", "nothing", "close",
      "ரத்து", "நிறுத்து", "வேண்டாம்", "மூடு"] },
];

const normalize = (s: string) =>
  s.toLowerCase()
    .replace(/[.,!?;:"'`]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/** Score a command against a transcript. Longer keyword matches win. */
export function matchCommand(rawTranscript: string): Command | null {
  const t = normalize(rawTranscript);
  if (!t) return null;
  let best: { cmd: Command; score: number } | null = null;
  for (const cmd of COMMANDS) {
    for (const kw of cmd.keywords) {
      const k = kw.toLowerCase();
      if (!t.includes(k)) continue;
      // score = keyword length; prefer multi-word / longer matches
      const score = k.length + (k.includes(" ") ? 5 : 0);
      if (!best || score > best.score) best = { cmd, score };
    }
  }
  return best?.cmd ?? null;
}

/** Suggestion list for the confirmation panel. */
export function topSuggestions(rawTranscript: string, n = 3): Command[] {
  const t = normalize(rawTranscript);
  if (!t) return [];
  const scored: { cmd: Command; score: number }[] = [];
  for (const cmd of COMMANDS) {
    if (cmd.kind === "cancel") continue;
    let best = 0;
    for (const kw of cmd.keywords) {
      const k = kw.toLowerCase();
      if (t.includes(k)) best = Math.max(best, k.length + (k.includes(" ") ? 5 : 0));
    }
    if (best > 0) scored.push({ cmd, score: best });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, n).map((s) => s.cmd);
}
