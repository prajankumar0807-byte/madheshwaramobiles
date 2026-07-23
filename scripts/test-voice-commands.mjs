// End-to-end style tests for the voice command matcher.
// Runs in Node — no browser required. Validates that Tamil and English
// phrases resolve to the correct website sections/actions.
//
// Usage: npm run test:voice

import { COMMANDS, matchCommand, topSuggestions } from "../src/lib/voice-commands.ts";

let passed = 0, failed = 0;
const fails = [];

function assert(name, cond, extra = "") {
  if (cond) { passed++; console.log(`  ✓ ${name}`); }
  else { failed++; fails.push(name + (extra ? " — " + extra : "")); console.log(`  ✗ ${name}${extra ? " — " + extra : ""}`); }
}

// Sanity: every command has both en + ta labels + keywords
console.log("\n▸ Structural checks");
for (const c of COMMANDS) {
  assert(`command "${c.id}" has EN + TA labels`, !!c.label.en && !!c.label.ta);
  assert(`command "${c.id}" has keywords`, Array.isArray(c.keywords) && c.keywords.length > 0);
  if (c.kind === "navigate") assert(`command "${c.id}" navigate has section id`, !!c.section);
}

// English navigation
console.log("\n▸ English navigation");
const EN = [
  ["take me to brands", "brands"],
  ["show me accessories please", "accessories"],
  ["I want to see services", "services"],
  ["go to about us", "about"],
  ["open contact", "contact"],
  ["scroll to gallery", "gallery"],
  ["back to home", "home"],
  // Voice search — product / service names route to correct section
  ["do you sell oppo", "brands"],
  ["I want a vivo phone", "brands"],
  ["redmi mobile", "brands"],
  ["realme available", "brands"],
  ["I need a charger", "accessories"],
  ["show me smart watch", "accessories"],
  ["power bank", "accessories"],
  ["earbuds", "accessories"],
  ["display repair", "services"],
  ["battery replacement", "services"],
  ["fix my mic", "services"],
];
for (const [phrase, id] of EN) {
  const m = matchCommand(phrase);
  assert(`"${phrase}" → ${id}`, m && m.id === id, m ? `got ${m.id}` : "no match");
}

// English actions
console.log("\n▸ English actions");
const ENA = [
  ["please call the shop", "call"],
  ["open whatsapp", "whatsapp"],
  ["instagram page", "instagram"],
  ["give me directions", "directions"],
  ["I want to write a review", "review"],
  ["cancel", "cancel"],
];
for (const [phrase, id] of ENA) {
  const m = matchCommand(phrase);
  assert(`"${phrase}" → ${id}`, m && m.id === id, m ? `got ${m.id}` : "no match");
}

// Tamil navigation & actions
console.log("\n▸ Tamil navigation & actions");
const TA = [
  ["எங்களை பற்றி காட்டு", "about"],
  ["பிராண்டுகள் காட்டு", "brands"],
  ["ஸ்மார்ட் போன் வேண்டும்", "brands"],
  ["துணை பொருட்கள்", "accessories"],
  ["சார்ஜர் வேண்டும்", "accessories"],
  ["பேட்டரி மாற்றம்", "services"],
  ["டிஸ்ப்ளே பழுது", "services"],
  ["சேவை பக்கம்", "services"],
  ["கடை புகைப்படங்கள்", "gallery"],
  ["தொடர்பு விவரம்", "contact"],
  ["மேலே செல்", "home"],
  ["கடையை அழை", "call"],
  ["வாட்ஸ்அப் திற", "whatsapp"],
  ["இன்ஸ்டா பக்கம்", "instagram"],
  ["வழி காட்டு", "directions"],
  ["மதிப்பீடு கொடு", "review"],
  ["ரத்து செய்", "cancel"],
];
for (const [phrase, id] of TA) {
  const m = matchCommand(phrase);
  assert(`"${phrase}" → ${id}`, m && m.id === id, m ? `got ${m.id}` : "no match");
}

// Ambiguous → suggestions non-empty
console.log("\n▸ Ambiguous transcripts return suggestions");
for (const phrase of ["mobile", "போன்", "charger power bank"]) {
  const sugg = topSuggestions(phrase, 3);
  assert(`"${phrase}" → suggestions`, sugg.length > 0, `got ${sugg.length}`);
}

// Unknown / empty transcripts
console.log("\n▸ Unknown / empty transcripts");
assert('"" → null', matchCommand("") === null);
assert('"xyzzy plugh" → null', matchCommand("xyzzy plugh") === null);
assert('whitespace → null', matchCommand("     ") === null);

// No runtime errors on odd input
console.log("\n▸ Robustness (no throws)");
try {
  matchCommand("!!!,,,???  ");
  matchCommand("CALL. THE. SHOP!!!");
  matchCommand("சார்ஜர்!!!");
  passed++; console.log("  ✓ handles punctuation & mixed case without throwing");
} catch (e) { failed++; fails.push("punctuation robustness: " + e.message); console.log("  ✗ threw", e.message); }

console.log(`\n${failed === 0 ? "✅" : "❌"} Voice commands: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("\nFailures:");
  fails.forEach((f) => console.log("  •", f));
  process.exit(1);
}
