import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "ta";

type Dict = Record<string, { en: string; ta: string }>;

export const dict = {
  nav_about: { en: "About", ta: "எங்களை பற்றி" },
  nav_brands: { en: "Brands", ta: "பிராண்டுகள்" },
  nav_accessories: { en: "Accessories", ta: "துணை பொருட்கள்" },
  nav_services: { en: "Services", ta: "சேவைகள்" },
  nav_gallery: { en: "Gallery", ta: "கேலரி" },
  nav_contact: { en: "Contact", ta: "தொடர்பு" },
  nav_chat: { en: "Chat", ta: "அரட்டை" },

  trusted_since: { en: "TRUSTED SINCE 2011", ta: "2011 முதல் நம்பகமானது" },
  hero_tagline_1: { en: "Latest Tech. Honest Prices.", ta: "சமீபத்திய தொழில்நுட்பம். நியாயமான விலை." },
  hero_tagline_2: { en: "Fast Fixes. Best Devices.", ta: "விரைவான பழுது. சிறந்த சாதனங்கள்." },
  hero_tagline_3: { en: "Premium Mobile Showroom.", ta: "பிரீமியம் மொபைல் ஷோரூம்." },
  hero_sub: {
    en: "Your flagship mobile destination in Mathur, Krishnagiri — featuring OPPO, Vivo, Redmi, Realme & a complete accessories ecosystem.",
    ta: "மாத்தூர், கிருஷ்ணகிரியில் உங்கள் முதன்மை மொபைல் இடம் — OPPO, Vivo, Redmi, Realme மற்றும் முழுமையான துணை பொருட்கள்.",
  },
  cta_explore: { en: "Explore Products", ta: "தயாரிப்புகளை பார்க்க" },
  cta_whatsapp: { en: "WhatsApp", ta: "வாட்ஸ்அப்" },
  cta_instagram: { en: "Instagram", ta: "இன்ஸ்டாகிராம்" },
  cta_directions: { en: "Directions", ta: "வழிகாட்டுதல்" },
  rating: { en: "Customer Rating", ta: "வாடிக்கையாளர் மதிப்பீடு" },
  same_day: { en: "Repair Service", ta: "பழுது சேவை" },

  stat_customers: { en: "Customers Served", ta: "வாடிக்கையாளர்கள்" },
  stat_repairs: { en: "Repairs Completed", ta: "பழுது முடிந்தவை" },
  stat_years: { en: "Years of Trust", ta: "ஆண்டுகளின் நம்பிக்கை" },
  stat_acc: { en: "Accessories", ta: "துணை பொருட்கள்" },

  our_story: { en: "OUR STORY", ta: "எங்கள் கதை" },
  legacy_h: { en: "A Legacy of", ta: "ஒரு பாரம்பரியம்" },
  legacy_h2: { en: "Trust & Technology", ta: "நம்பிக்கை & தொழில்நுட்பம்" },
  about_p1: {
    en: "Founded in 2011, Sri Madheshwara Mobiles has grown from a small neighborhood store into Mathur's most trusted mobile destination. We've built our reputation on three simple promises: genuine products, honest pricing, and lightning-fast service.",
    ta: "2011-ல் நிறுவப்பட்டு, ஸ்ரீ மதேஷ்வரா மொபைல்ஸ் ஒரு சிறிய கடையில் இருந்து மாத்தூரின் மிக நம்பகமான மொபைல் கடையாக வளர்ந்துள்ளது. அசல் தயாரிப்புகள், நியாயமான விலை, விரைவான சேவை — இவையே எங்கள் வாக்குறுதி.",
  },
  about_p2: {
    en: "Today, we serve thousands of happy customers across Krishnagiri with the latest smartphones, premium accessories, and expert repair services — all under one roof.",
    ta: "இன்று, கிருஷ்ணகிரி முழுவதும் ஆயிரக்கணக்கான வாடிக்கையாளர்களுக்கு சமீபத்திய ஸ்மார்ட்போன்கள், பிரீமியம் துணை பொருட்கள் மற்றும் நிபுணர் பழுது சேவைகளை வழங்குகிறோம்.",
  },
  owner: { en: "OWNER", ta: "உரிமையாளர்" },
  manager: { en: "MANAGER", ta: "மேலாளர்" },

  why_us: { en: "WHY CHOOSE US", ta: "ஏன் தேர்வு செய்ய வேண்டும்" },
  why_h: { en: "The", ta: "" },
  why_h2: { en: "Promise", ta: "வாக்குறுதி" },
  r_genuine_t: { en: "100% Genuine", ta: "100% அசல்" },
  r_genuine_d: { en: "Authentic devices & accessories, every time.", ta: "ஒவ்வொரு முறையும் அசல் சாதனங்கள் மற்றும் துணை பொருட்கள்." },
  r_fast_t: { en: "Fast Service", ta: "விரைவான சேவை" },
  r_fast_d: { en: "Most repairs completed the same day.", ta: "பெரும்பாலான பழுதுகள் அதே நாளில் முடிக்கப்படும்." },
  r_honest_t: { en: "Honest Pricing", ta: "நியாயமான விலை" },
  r_honest_d: { en: "Transparent rates with no hidden costs.", ta: "மறைக்கப்பட்ட கட்டணம் இல்லாமல் வெளிப்படையான விலை." },
  r_expert_t: { en: "Expert Technicians", ta: "நிபுணர் தொழில்நுட்பர்கள்" },
  r_expert_d: { en: "Years of certified repair experience.", ta: "பல ஆண்டுகள் சான்றிதழ் பெற்ற பழுது அனுபவம்." },
  r_warranty_t: { en: "Warranty Support", ta: "உத்தரவாத ஆதரவு" },
  r_warranty_d: { en: "Backed warranty on devices & repairs.", ta: "சாதனங்கள் மற்றும் பழுதுகளுக்கு உத்தரவாதம்." },
  r_2011_t: { en: "Since 2011", ta: "2011 முதல்" },
  r_2011_d: { en: "A trusted name in Mathur, Krishnagiri.", ta: "மாத்தூர், கிருஷ்ணகிரியில் நம்பகமான பெயர்." },

  brands_h1: { en: "FLAGSHIP BRANDS", ta: "முதன்மை பிராண்டுகள்" },
  brands_h2: { en: "Top Brands,", ta: "சிறந்த பிராண்டுகள்," },
  brands_h3: { en: "All In One Place", ta: "அனைத்தும் ஒரே இடத்தில்" },

  acc_h1: { en: "ACCESSORIES SHOWCASE", ta: "துணை பொருட்கள் காட்சி" },
  acc_h2: { en: "Everything Your Phone", ta: "உங்கள் போனுக்கு தேவையான" },
  acc_h3: { en: "Deserves", ta: "அனைத்தும்" },
  acc_catalog: { en: "Full Catalog", ta: "முழு பட்டியல்" },

  cat_smartphones: { en: "Smartphones", ta: "ஸ்மார்ட்போன்கள்" },
  cat_chargers: { en: "Chargers & Cables", ta: "சார்ஜர் & கேபிள்" },
  cat_glass: { en: "Tempered Glass", ta: "டெம்பர்டு கிளாஸ்" },
  cat_batteries: { en: "Batteries", ta: "பேட்டரிகள்" },
  cat_watches: { en: "Smart Watches", ta: "ஸ்மார்ட் வாட்ச்" },
  cat_speakers: { en: "Speakers", ta: "ஸ்பீக்கர்கள்" },
  cat_earbuds: { en: "Earbuds & Headphones", ta: "ஈர்பட்ஸ் & ஹெட்போன்" },
  cat_memory: { en: "Memory & Pendrives", ta: "மெமரி & பென்ட்ரைவ்" },
  cat_powerbanks: { en: "Power Banks", ta: "பவர் பேங்க்" },
  cat_otg: { en: "OTG & Type-C", ta: "OTG & டைப்-சி" },

  svc_h1: { en: "MOBILE SERVICES", ta: "மொபைல் சேவைகள்" },
  svc_h2: { en: "Expert Repairs,", ta: "நிபுணர் பழுது," },
  svc_h3: { en: "Done Right", ta: "சரியாக செய்யப்படுகிறது" },
  svc_book: { en: "Book a Repair", ta: "பழுது பதிவு செய்க" },
  svc_sameday: { en: "Most repairs same-day", ta: "பெரும்பாலும் அதே நாளில்" },
  svc_display: { en: "Display Replacement", ta: "டிஸ்ப்ளே மாற்றம்" },
  svc_battery: { en: "Battery Replacement", ta: "பேட்டரி மாற்றம்" },
  svc_speaker: { en: "Speaker Repair", ta: "ஸ்பீக்கர் பழுது" },
  svc_mic: { en: "Mic Repair", ta: "மைக் பழுது" },
  svc_charging: { en: "Charging Port Repair", ta: "சார்ஜிங் போர்ட் பழுது" },
  svc_kdisplay: { en: "Display Repair", ta: "டிஸ்ப்ளே பழுது" },
  svc_kspeaker: { en: "Speaker & Mic Repair", ta: "ஸ்பீக்கர் & மைக் பழுது" },
  tag_smart: { en: "SMARTPHONE", ta: "ஸ்மார்ட்போன்" },
  tag_keypad: { en: "KEYPAD", ta: "கீபேட்" },

  test_h1: { en: "CUSTOMER LOVE", ta: "வாடிக்கையாளர் அன்பு" },
  test_h2: { en: "What Our", ta: "எங்கள்" },
  test_h3: { en: "Customers Say", ta: "வாடிக்கையாளர்கள் என்ன சொல்கிறார்கள்" },

  gallery_h1: { en: "GALLERY", ta: "கேலரி" },
  gallery_h2: { en: "Inside Our", ta: "எங்கள்" },
  gallery_h3: { en: "Showroom", ta: "ஷோரூம் உள்ளே" },

  contact_h1: { en: "VISIT US", ta: "எங்களை சந்திக்க" },
  contact_h2: { en: "Let's", ta: "இணைவோம்" },
  contact_h3: { en: "Connect", ta: "" },
  call_us: { en: "CALL US", ta: "அழைக்க" },
  whatsapp_label: { en: "WHATSAPP", ta: "வாட்ஸ்அப்" },
  chat_now: { en: "Chat Instantly", ta: "உடனே அரட்டை" },
  instagram_label: { en: "INSTAGRAM", ta: "இன்ஸ்டாகிராம்" },
  location_label: { en: "LOCATION", ta: "இருப்பிடம்" },
  address: { en: "Mathur Bus Stand, Krishnagiri – 635 203", ta: "மாத்தூர் பேருந்து நிலையம், கிருஷ்ணகிரி – 635 203" },

  hours_h: { en: "BUSINESS HOURS", ta: "வேலை நேரம்" },
  hours_1: { en: "Mon – Sat · 9:30 AM – 9:30 PM", ta: "திங்கள் – சனி · காலை 9:30 – இரவு 9:30" },
  hours_2: { en: "Sunday · 10:00 AM – 8:00 PM", ta: "ஞாயிறு · காலை 10:00 – இரவு 8:00" },
  quick_links: { en: "QUICK LINKS", ta: "விரைவு இணைப்புகள்" },
  footer_tag: { en: "Latest Tech. Honest Prices. Fast Fixes. Best Devices.", ta: "சமீபத்திய தொழில்நுட்பம். நியாயமான விலை. விரைவான பழுது." },
  rights: { en: "All rights reserved.", ta: "அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை." },

  loading: { en: "LOADING EXPERIENCE", ta: "ஏற்றுகிறது..." },
} satisfies Dict;

type Key = keyof typeof dict;

const Ctx = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: (k: Key) => string }>({
  lang: "en", setLang: () => {}, t: (k) => dict[k].en,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  useEffect(() => {
    const stored = typeof window !== "undefined" ? (localStorage.getItem("lang") as Lang | null) : null;
    if (stored === "en" || stored === "ta") setLangState(stored);
  }, []);
  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem("lang", l);
  };
  const t = (k: Key) => dict[k][lang];
  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

export const useI18n = () => useContext(Ctx);

export function LanguageToggle({ className = "" }: { className?: string }) {
  const { lang, setLang } = useI18n();
  return (
    <button
      onClick={() => setLang(lang === "en" ? "ta" : "en")}
      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full glass text-xs font-semibold tracking-wider text-gold hover:bg-[color:var(--gold)]/10 transition ${className}`}
      aria-label="Toggle language"
    >
      <span className={lang === "en" ? "opacity-100" : "opacity-40"}>EN</span>
      <span className="opacity-30">/</span>
      <span className={lang === "ta" ? "opacity-100" : "opacity-40"}>தமிழ்</span>
    </button>
  );
}
