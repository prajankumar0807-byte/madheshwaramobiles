import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Phone, MapPin, Instagram, MessageCircle, Sparkles, Shield, Wrench, Zap,
  Award, Clock, BadgeCheck, Battery, Headphones, Watch, Cable, Smartphone,
  Volume2, Usb, HardDrive, Star, ChevronRight,
} from "lucide-react";
import { ShopLogo } from "@/components/ShopLogo";
import { ParticleField } from "@/components/ParticleField";
import { TypingSlogan } from "@/components/TypingSlogan";
import { Counter } from "@/components/Counter";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { AIChatFab } from "@/components/AIChatFab";
import { LeadCapture } from "@/components/LeadCapture";
import { useI18n, LanguageToggle, dict } from "@/lib/i18n";
import shopFront from "@/assets/shop-front.jpg";
import { Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { VisitorBump } from "@/components/VisitorCounter";
import { LiveOffers } from "@/components/LiveOffers";
import ownerImg from "@/assets/owner-madhesh.jpg";

const GOOGLE_REVIEW_URL =
  "https://www.google.com/search?sca_esv=dd629fef2b47c84e&hl=en-IN&sxsrf=ANbL-n6hr5gRpxvtysQFIDCf_XkrUWhPtA:1780212809677&q=sri+madheshwara+mobiles+krishnagiri+mathur+reviews&uds=ALYpb_npVvcdf5ZGWpYpXvnW4SLa1fKDD85mojjlzrXj6WW07qxgOTUaJ5D8D7Oklfe5_XrYQD1H8AQgZyrfZ3polSDrLalweZwIzXFNYSq-LSMylaDpxdh_uXdPsLL3VJZYKur65C5bxIwBZYI6HcU5_HBt4GqMGmQQmKxa8YB16XIgL6-43KNczvFcASTGOeZFljQu7XHUU4UDLpQNwE4Ng1V0g2bybcBCtUy1k0nnRxjoIsHpjOFmE3vS9vKPnZ6-9q4pwp83gAG7edusoFH1Bxc4J4wbW6KDOs0ArZvcaBBYeSuLjnLa3fArXK7W7Dk7WD4OexXE632c--eR6tw6m1o_XTdN_z0DM57eFOiQVa1tlSDjRTzFLH1bfKT0Ti2CvIULIjF3AVqqXqDZXdmJD7J9MRY3ORdYZh8aud4F05cdL60lR-2hjyE9Yv1rUIeIjRe8AfmH8blYj-40X_60e5qy8nmMS17j8RLlCpyymgdcU0hecrw3zI0e7e6TvLaQwmqWCQd97x39F9SvJwuFR_HaRwFwcAHPg5KbXll1bvlbKR_Z9Q8Tzq24H8qPQeRBAxlX3xsO&si=AL3DRZEsmMGCryMMFSHJ3StBhOdZ2-6yYkXd_doETEE1OR-qORX2VPGGUuFeq36WQwrh8UkRHvaodXkby7nmTpMsDHYqY5Sq5pu3JXf6XRctDKDIaIkFDJnXQvRjXpzaO-0FDXNJPog75-ODtVoGGTwP2v41ffG_VtLJMY2FFAN-hTG3F0xoD64%3D&sa=X&ved=2ahUKEwjSxZTBgeOUAxVkR2cHHYIIF6oQk8gLegQIHxAB&ictx=1";

import productSmartphone from "@/assets/product-smartphone.jpg";
import productAudio from "@/assets/product-audio.jpg";
import productWatch from "@/assets/product-watch.jpg";
import productCharger from "@/assets/product-charger.jpg";
import productGlass from "@/assets/product-glass.jpg";
import productRepair from "@/assets/product-repair.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sri Madheshwara Mobiles — Latest Tech. Honest Prices." },
      { name: "description", content: "Trusted mobile store in Mathur, Krishnagiri since 2011. OPPO, Vivo, Redmi, Realme phones, premium accessories and fast repairs." },
      { property: "og:title", content: "Sri Madheshwara Mobiles" },
      { property: "og:description", content: "Latest Tech. Honest Prices. Fast Fixes. Best Devices." },
      { property: "og:image", content: productSmartphone },
    ],
  }),
  component: Index,
});

const WA = "https://wa.me/918124995343";
const INSTA = "https://www.instagram.com/madheshwara.mobiles?igsh=d2c4OTFhdndzNmxh";
const MAPS = "https://maps.app.goo.gl/teuc6oYxZihVf3vH6";
const TEL = "tel:+918124995343";

const brands = ["OPPO", "Vivo", "Redmi", "Realme"];

type Tk = keyof typeof dict;

const reasons: { icon: typeof BadgeCheck; t: Tk; d: Tk }[] = [
  { icon: BadgeCheck, t: "r_genuine_t", d: "r_genuine_d" },
  { icon: Zap, t: "r_fast_t", d: "r_fast_d" },
  { icon: Award, t: "r_honest_t", d: "r_honest_d" },
  { icon: Wrench, t: "r_expert_t", d: "r_expert_d" },
  { icon: Shield, t: "r_warranty_t", d: "r_warranty_d" },
  { icon: Clock, t: "r_2011_t", d: "r_2011_d" },
];

const categories: { icon: typeof Smartphone; key: Tk; img: string }[] = [
  { icon: Smartphone, key: "cat_smartphones", img: productSmartphone },
  { icon: Cable, key: "cat_chargers", img: productCharger },
  { icon: Shield, key: "cat_glass", img: productGlass },
  { icon: Battery, key: "cat_batteries", img: productCharger },
  { icon: Watch, key: "cat_watches", img: productWatch },
  { icon: Volume2, key: "cat_speakers", img: productAudio },
  { icon: Headphones, key: "cat_earbuds", img: productAudio },
  { icon: HardDrive, key: "cat_memory", img: productCharger },
  { icon: Zap, key: "cat_powerbanks", img: productCharger },
  { icon: Usb, key: "cat_otg", img: productCharger },
];

const accessories = [
  "Chargers", "Cables", "Gorilla Tempered Glass", "UV Glass", "Batteries",
  "Back Pouch", "Flip Pouch", "Smart Watches", "Bluetooth Speakers", "Neckbands",
  "Earbuds", "Headphones", "Memory Cards", "Pendrives", "Power Banks",
  "Laptop Mouse", "Mobile Stand", "Car Chargers", "OTG Connectors", "Type-C Converters",
  "Cable Protectors", "Mobile Back Skins", "Stickers", "Screen Guards", "Keypad Mobiles",
];

const services: { titleKey: Tk; tagKey: Tk }[] = [
  { titleKey: "svc_display", tagKey: "tag_smart" },
  { titleKey: "svc_battery", tagKey: "tag_smart" },
  { titleKey: "svc_speaker", tagKey: "tag_smart" },
  { titleKey: "svc_mic", tagKey: "tag_smart" },
  { titleKey: "svc_charging", tagKey: "tag_smart" },
  { titleKey: "svc_kdisplay", tagKey: "tag_keypad" },
  { titleKey: "svc_battery", tagKey: "tag_keypad" },
  { titleKey: "svc_kspeaker", tagKey: "tag_keypad" },
];

const testimonials = [
  { name: "Karthik R.", text: { en: "Got my Vivo display replaced same day. Honest pricing and friendly staff. Highly recommend!", ta: "என் Vivo டிஸ்ப்ளே அதே நாளில் மாற்றினார்கள். நியாயமான விலை, நல்ல பணியாளர்கள்!" }, rating: 5 },
  { name: "Priya S.", text: { en: "Bought a Redmi from here in 2019, still going strong. Now my whole family shops here.", ta: "2019-ல் இங்கே Redmi வாங்கினேன், இன்னும் நன்றாக இயங்குகிறது. இப்போது குடும்பம் முழுவதும் இங்கேதான்." }, rating: 5 },
  { name: "Manoj K.", text: { en: "Best accessories collection in Mathur. Genuine products and unbeatable prices.", ta: "மாத்தூரில் சிறந்த துணை பொருட்கள். அசல் தயாரிப்புகள், ஈடு இல்லாத விலை." }, rating: 5 },
  { name: "Anitha M.", text: { en: "Battery replaced in 30 minutes. Phone feels brand new. Thank you Madhesh sir!", ta: "30 நிமிடத்தில் பேட்டரி மாற்றினார்கள். போன் புதிதாக உள்ளது. நன்றி மதேஷ் சார்!" }, rating: 5 },
];

const galleryImages = [shopFront, productSmartphone, productAudio, productWatch, productCharger, productGlass, productRepair, shopFront];

function Index() {
  const { t, lang } = useI18n();
  const [loaded, setLoaded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const tm = setTimeout(() => setLoaded(true), 1400);
    return () => clearTimeout(tm);
  }, []);

  const navLinks: { key: Tk; href: string }[] = [
    { key: "nav_about", href: "#about" },
    { key: "nav_brands", href: "#brands" },
    { key: "nav_accessories", href: "#accessories" },
    { key: "nav_services", href: "#services" },
    { key: "nav_gallery", href: "#gallery" },
    { key: "nav_contact", href: "#contact" },
  ];

  return (
    <>
      {/* Splash */}
      <div
        className={`fixed inset-0 z-[100] flex items-center justify-center bg-background transition-opacity duration-700 ${
          loaded ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <div className="flex flex-col items-center gap-6">
          <ShopLogo className="h-24 w-24 sm:h-32 sm:w-32 animate-float" />
          <div className="font-display text-xs sm:text-sm tracking-[0.4em] gradient-gold-text">{t("loading")}</div>
        </div>
      </div>

      <main className="relative min-h-screen text-foreground overflow-x-hidden">
        {/* Nav */}
        <nav className="fixed top-0 inset-x-0 z-40 glass border-b border-[color:var(--gold)]/15">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2">
            <a href="#top" className="flex items-center gap-2 sm:gap-3 min-w-0">
              <ShopLogo className="h-8 w-8 sm:h-10 sm:w-10 shrink-0" glow={false} />
              <div className="hidden xs:block sm:block leading-tight min-w-0">
                <div className="font-display text-[11px] sm:text-sm gradient-gold-text truncate">SRI MADHESHWARA</div>
                <div className="text-[9px] sm:text-[10px] tracking-[0.25em] text-muted-foreground">MOBILES · SINCE 2011</div>
              </div>
            </a>
            <div className="hidden lg:flex items-center gap-6 text-sm text-muted-foreground">
              {navLinks.map(l => (
                <a key={l.key} href={l.href} className="hover:text-gold transition-colors">{t(l.key)}</a>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <LanguageToggle />
              <a href={WA} target="_blank" rel="noreferrer"
                className="hidden sm:inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full gradient-gold-bg text-background text-xs sm:text-sm font-semibold shadow-gold hover:scale-105 transition">
                <MessageCircle className="h-4 w-4" /> {t("nav_chat")}
              </a>
              <button
                className="lg:hidden p-2 rounded-lg glass text-gold"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Menu"
              >
                <div className="h-4 w-5 flex flex-col justify-between">
                  <span className={`block h-0.5 bg-current transition ${menuOpen ? "rotate-45 translate-y-[7px]" : ""}`} />
                  <span className={`block h-0.5 bg-current transition ${menuOpen ? "opacity-0" : ""}`} />
                  <span className={`block h-0.5 bg-current transition ${menuOpen ? "-rotate-45 -translate-y-[7px]" : ""}`} />
                </div>
              </button>
            </div>
          </div>
          {/* Mobile menu */}
          {menuOpen && (
            <div className="lg:hidden glass border-t border-[color:var(--gold)]/15 px-4 py-4 space-y-2">
              {navLinks.map(l => (
                <a key={l.key} href={l.href} onClick={() => setMenuOpen(false)}
                  className="block py-2 text-sm text-muted-foreground hover:text-gold transition">{t(l.key)}</a>
              ))}
              <a href={WA} target="_blank" rel="noreferrer"
                className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-full gradient-gold-bg text-background text-sm font-semibold">
                <MessageCircle className="h-4 w-4" /> {t("nav_chat")}
              </a>
            </div>
          )}
        </nav>

        {/* Hero */}
        <section id="top" className="relative min-h-[100svh] pt-20 sm:pt-24 pb-12 sm:pb-16 flex items-center overflow-hidden">
          <ParticleField />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(232,196,108,0.18),transparent_60%)] pointer-events-none" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 grid md:grid-cols-2 gap-8 md:gap-10 items-center w-full">
            <div className="animate-rise text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-[10px] sm:text-xs tracking-widest text-gold mb-5 sm:mb-6">
                <Sparkles className="h-3 w-3" /> {t("trusted_since")}
              </div>
              <h1 className="font-display text-3xl sm:text-5xl md:text-6xl leading-[1.05]">
                <span className="block text-foreground">SRI MADHESHWARA</span>
                <span className="block gradient-gold-text mt-2">MOBILES</span>
              </h1>
              <div className="mt-5 sm:mt-6 text-lg sm:text-xl md:text-2xl min-h-[2.5rem]">
                <TypingSlogan
                  key={lang}
                  phrases={[t("hero_tagline_1"), t("hero_tagline_2"), t("hero_tagline_3")]}
                />
              </div>
              <p className="mt-4 sm:mt-5 text-sm sm:text-base text-muted-foreground max-w-md mx-auto md:mx-0">
                {t("hero_sub")}
              </p>
              <div className="mt-6 sm:mt-8 flex flex-wrap gap-2 sm:gap-3 justify-center md:justify-start">
                <a href="#accessories" className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-full gradient-gold-bg text-background font-semibold text-sm shadow-gold hover:scale-105 transition">
                  {t("cta_explore")} <ChevronRight className="h-4 w-4" />
                </a>
                <a href={WA} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-full glass text-foreground text-sm hover:border-[color:var(--gold)] transition">
                  <MessageCircle className="h-4 w-4 text-gold" /> {t("cta_whatsapp")}
                </a>
                <a href={INSTA} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-full glass text-foreground text-sm hover:border-[color:var(--gold)] transition">
                  <Instagram className="h-4 w-4 text-gold" /> {t("cta_instagram")}
                </a>
                <a href={MAPS} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-full glass text-foreground text-sm hover:border-[color:var(--gold)] transition">
                  <MapPin className="h-4 w-4 text-gold" /> {t("cta_directions")}
                </a>
              </div>
            </div>
            <div className="relative flex justify-center items-center order-first md:order-last">
              <div className="absolute inset-0 gradient-gold-bg opacity-20 blur-3xl rounded-full" />
              <div className="relative w-56 h-56 sm:w-72 sm:h-72 md:w-96 md:h-96 rounded-3xl overflow-hidden shadow-gold animate-float">
                <img src={productSmartphone} alt="Premium smartphone showroom" width={1024} height={1024}
                  className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <ShopLogo className="h-10 w-10" glow={false} />
                  <div className="text-[10px] tracking-[0.3em] text-gold">FLAGSHIP</div>
                </div>
              </div>
              <div className="absolute top-2 right-1 sm:top-10 sm:right-2 glass-card rounded-2xl px-3 py-2 text-xs animate-float" style={{ animationDelay: "1s" }}>
                <div className="text-gold font-semibold">★ 4.9</div>
                <div className="text-muted-foreground text-[10px]">{t("rating")}</div>
              </div>
              <div className="absolute bottom-2 left-1 sm:bottom-10 sm:left-0 glass-card rounded-2xl px-3 py-2 text-xs animate-float" style={{ animationDelay: "2s" }}>
                <div className="text-gold font-semibold">⚡</div>
                <div className="text-muted-foreground text-[10px]">{t("same_day")}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="relative py-12 sm:py-16 border-y border-[color:var(--gold)]/15">
          <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <Counter to={15000} suffix="+" label={t("stat_customers")} />
            <Counter to={8500} suffix="+" label={t("stat_repairs")} />
            <Counter to={14} suffix="+" label={t("stat_years")} />
            <Counter to={300} suffix="+" label={t("stat_acc")} />
          </div>
          <VisitorBump />
        </section>

        <LiveOffers />

        {/* About */}
        <section id="about" className="relative py-16 sm:py-24 px-4">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 md:gap-12 items-center">
            <div>
              <div className="text-[10px] sm:text-xs tracking-[0.4em] text-gold mb-3">{t("our_story")}</div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl mb-5 sm:mb-6">{t("legacy_h")} <span className="gradient-gold-text">{t("legacy_h2")}</span></h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4">{t("about_p1")}</p>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-7 sm:mb-8">{t("about_p2")}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="glass-card rounded-xl p-4 flex items-center gap-4">
                  <img
                    src={ownerImg}
                    alt="M.V.MADHESH — Owner of Sri Madheshwara Mobiles"
                    className="h-16 w-16 sm:h-20 sm:w-20 rounded-full object-cover ring-2 ring-[color:var(--gold)]/60 shadow-gold"
                    loading="lazy"
                  />
                  <div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">{t("owner")}</div>
                    <div className="font-semibold text-gold mt-1 text-sm sm:text-base">M.V.MADHESH</div>
                  </div>
                </div>
                <div className="glass-card rounded-xl p-4 flex items-center">
                  <div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">{t("manager")}</div>
                    <div className="font-semibold text-gold mt-1 text-sm sm:text-base">Malathi Madhesh</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="space-y-3 sm:space-y-4">
                {[
                  { y: "2011", t: { en: "The Beginning", ta: "ஆரம்பம்" }, d: { en: "Sri Madheshwara Mobiles opens its doors in Mathur.", ta: "ஸ்ரீ மதேஷ்வரா மொபைல்ஸ் மாத்தூரில் தொடங்கப்பட்டது." } },
                  { y: "2016", t: { en: "Expanding Services", ta: "சேவைகள் விரிவாக்கம்" }, d: { en: "Launched full-service mobile repair centre.", ta: "முழுமையான மொபைல் பழுது மையம் தொடங்கப்பட்டது." } },
                  { y: "2020", t: { en: "Premium Brand Hub", ta: "பிரீமியம் பிராண்ட் மையம்" }, d: { en: "Authorized stockist for OPPO, Vivo, Redmi, Realme.", ta: "OPPO, Vivo, Redmi, Realme அங்கீகரிக்கப்பட்ட விற்பனையாளர்." } },
                  { y: lang === "ta" ? "இன்று" : "Today", t: { en: "Trusted Flagship", ta: "நம்பகமான முதன்மை" }, d: { en: "Serving 15,000+ happy customers across Krishnagiri.", ta: "கிருஷ்ணகிரியில் 15,000+ வாடிக்கையாளர்களுக்கு சேவை." } },
                ].map((m, i) => (
                  <div key={i} className="glass-card rounded-2xl p-4 sm:p-5 flex gap-3 sm:gap-4 hover:translate-x-1 transition">
                    <div className="font-display text-lg sm:text-2xl gradient-gold-text shrink-0 w-16 sm:w-20">{m.y}</div>
                    <div className="min-w-0">
                      <div className="font-semibold text-sm sm:text-base">{m.t[lang]}</div>
                      <div className="text-xs sm:text-sm text-muted-foreground">{m.d[lang]}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Why Us */}
        <section className="relative py-16 sm:py-24 px-4 bg-gradient-to-b from-transparent via-[color:var(--card)]/30 to-transparent">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10 sm:mb-14">
              <div className="text-[10px] sm:text-xs tracking-[0.4em] text-gold mb-3">{t("why_us")}</div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl">{t("why_h")} <span className="gradient-gold-text">Madheshwara</span> {t("why_h2")}</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {reasons.map((r, i) => (
                <div key={i} className="glass-card rounded-2xl p-5 sm:p-6 hover:-translate-y-1 hover:border-[color:var(--gold)]/60 transition group">
                  <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-xl gradient-gold-bg flex items-center justify-center mb-4 group-hover:scale-110 transition">
                    <r.icon className="h-5 w-5 sm:h-6 sm:w-6 text-background" />
                  </div>
                  <div className="font-semibold text-base sm:text-lg mb-1">{t(r.t)}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">{t(r.d)}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Brands */}
        <section id="brands" className="relative py-16 sm:py-24 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10 sm:mb-14">
              <div className="text-[10px] sm:text-xs tracking-[0.4em] text-gold mb-3">{t("brands_h1")}</div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl">{t("brands_h2")} <span className="gradient-gold-text">{t("brands_h3")}</span></h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
              {brands.map(b => (
                <div key={b} className="relative glass-card rounded-2xl p-6 sm:p-8 flex items-center justify-center group overflow-hidden aspect-[3/2]">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition gradient-gold-bg blur-2xl" />
                  <div className="relative font-display text-xl sm:text-2xl md:text-3xl gradient-gold-text">{b}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Accessories */}
        <section id="accessories" className="relative py-16 sm:py-24 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10 sm:mb-14">
              <div className="text-[10px] sm:text-xs tracking-[0.4em] text-gold mb-3">{t("acc_h1")}</div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl">{t("acc_h2")} <span className="gradient-gold-text">{t("acc_h3")}</span></h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4 mb-8 sm:mb-10">
              {categories.map((c, i) => (
                <div key={i} className="glass-card rounded-2xl overflow-hidden hover:-translate-y-1 hover:border-[color:var(--gold)]/60 transition group">
                  <div className="aspect-square overflow-hidden relative">
                    <img src={c.img} alt={dict[c.key].en} loading="lazy" width={1024} height={1024}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
                    <c.icon className="absolute top-2 right-2 h-5 w-5 text-gold drop-shadow" />
                  </div>
                  <div className="p-3 text-center">
                    <div className="text-xs sm:text-sm font-medium">{t(c.key)}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="glass rounded-3xl p-5 sm:p-6 md:p-8">
              <div className="text-sm text-gold mb-4 font-semibold">{t("acc_catalog")}</div>
              <div className="flex flex-wrap gap-2">
                {accessories.map(a => (
                  <span key={a} className="px-3 py-1.5 rounded-full text-[11px] sm:text-xs glass-card hover:bg-[color:var(--gold)]/10 transition cursor-default">
                    {a}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Services */}
        <section id="services" className="relative py-16 sm:py-24 px-4 bg-gradient-to-b from-transparent via-[color:var(--card)]/30 to-transparent">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10 sm:mb-14">
              <div className="text-[10px] sm:text-xs tracking-[0.4em] text-gold mb-3">{t("svc_h1")}</div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl">{t("svc_h2")} <span className="gradient-gold-text">{t("svc_h3")}</span></h2>
            </div>
            <div className="grid md:grid-cols-3 gap-5 mb-8">
              <div className="md:col-span-1 rounded-3xl overflow-hidden glass-card aspect-square md:aspect-auto">
                <img src={productRepair} alt="Mobile repair workshop" loading="lazy" width={1024} height={1024}
                  className="w-full h-full object-cover" />
              </div>
              <div className="md:col-span-2 grid sm:grid-cols-2 gap-4">
                {services.map((s, i) => (
                  <div key={i} className="glass-card rounded-2xl p-4 sm:p-5 hover:border-[color:var(--gold)]/60 transition group">
                    <div className="flex items-center justify-between mb-3">
                      <Wrench className="h-5 w-5 text-gold" />
                      <span className="text-[10px] tracking-widest text-muted-foreground">{t(s.tagKey)}</span>
                    </div>
                    <div className="font-semibold text-sm sm:text-base">{t(s.titleKey)}</div>
                    <div className="text-xs text-muted-foreground mt-1">{t("svc_sameday")}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="text-center">
              <a href={WA} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-2 px-5 sm:px-6 py-3 rounded-full gradient-gold-bg text-background font-semibold shadow-gold hover:scale-105 transition text-sm">
                {t("svc_book")} <ChevronRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="relative py-16 sm:py-24 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10 sm:mb-14">
              <div className="text-[10px] sm:text-xs tracking-[0.4em] text-gold mb-3">{t("test_h1")}</div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl">{t("test_h2")} <span className="gradient-gold-text">{t("test_h3")}</span></h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4 sm:gap-5">
              {testimonials.map((tm, i) => (
                <div key={i} className="glass-card rounded-2xl p-5 sm:p-6">
                  <div className="flex gap-1 mb-3">
                    {Array.from({ length: tm.rating }).map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-[color:var(--gold)] text-gold" />
                    ))}
                  </div>
                  <p className="text-sm sm:text-base text-muted-foreground italic mb-4">"{tm.text[lang]}"</p>
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full gradient-gold-bg flex items-center justify-center text-background font-bold">
                      {tm.name[0]}
                    </div>
                    <div className="font-semibold text-sm sm:text-base">{tm.name}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-10 sm:mt-12 glass-card rounded-3xl p-6 sm:p-8 text-center max-w-2xl mx-auto">
              <div className="flex justify-center gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} className="h-5 w-5 fill-[color:var(--gold)] text-gold" />
                ))}
              </div>
              <h3 className="text-xl sm:text-2xl font-display mb-2">
                Loved our service? <span className="gradient-gold-text">Rate us on Google</span>
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground mb-5">
                Your review helps more families in Mathur discover us. It takes only 30 seconds.
              </p>
              <a
                href={GOOGLE_REVIEW_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-gold-bg text-background font-semibold shadow-gold hover:scale-[1.02] transition"
              >
                <Star className="h-4 w-4" />
                Write a Google Review
                <ChevronRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>

        {/* Gallery */}
        <section id="gallery" className="relative py-16 sm:py-24 px-4 bg-gradient-to-b from-transparent via-[color:var(--card)]/30 to-transparent">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10 sm:mb-14">
              <div className="text-[10px] sm:text-xs tracking-[0.4em] text-gold mb-3">{t("gallery_h1")}</div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl">{t("gallery_h2")} <span className="gradient-gold-text">{t("gallery_h3")}</span></h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {galleryImages.map((src, i) => (
                <div key={i} className={`relative rounded-2xl overflow-hidden glass-card group ${i % 3 === 0 ? "row-span-2 aspect-[3/4]" : "aspect-square"}`}>
                  <img src={src} alt={`Showroom shot ${i + 1}`} loading="lazy" width={1024} height={1024}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
                  <div className="absolute bottom-2 left-2 right-2 text-[10px] tracking-widest text-gold">
                    SHOT {String(i + 1).padStart(2, "0")}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Our Shop - Real storefront */}
        <section className="relative py-16 sm:py-24 px-4">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 md:gap-10 items-center">
            <div className="relative rounded-3xl overflow-hidden glass-card shadow-gold group">
              <img src={shopFront} alt="Sri Madheshwara Mobiles storefront at Mathur Bus Stand"
                loading="lazy" width={1600} height={1200}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShopLogo className="h-9 w-9" glow={false} />
                  <div className="text-[10px] tracking-[0.3em] text-gold">OUR SHOP</div>
                </div>
                <div className="text-[10px] tracking-widest text-gold">MATHUR · 635203</div>
              </div>
            </div>
            <div>
              <div className="text-[10px] sm:text-xs tracking-[0.4em] text-gold mb-3">VISIT US IN PERSON</div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl">Step Into Our <span className="gradient-gold-text">Showroom</span></h2>
              <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
                Located right at Mathur Bus Stand, our flagship store has live demo units of the
                latest OPPO, Vivo, Redmi & Realme phones, a full accessories wall and an in-house
                repair workshop. Drop in any day — we'd love to help.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <a href={MAPS} target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-full gradient-gold-bg text-background font-semibold text-sm shadow-gold hover:scale-105 transition">
                  <MapPin className="h-4 w-4" /> Get Directions
                </a>
                <a href={TEL}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-full glass text-foreground text-sm hover:border-[color:var(--gold)] transition">
                  <Phone className="h-4 w-4 text-gold" /> Call Now
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Lead Capture */}
        <LeadCapture />

        {/* Contact */}
        <section id="contact" className="relative py-16 sm:py-24 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10 sm:mb-14">
              <div className="text-[10px] sm:text-xs tracking-[0.4em] text-gold mb-3">{t("contact_h1")}</div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl">{t("contact_h2")} <span className="gradient-gold-text">{t("contact_h3")}</span></h2>
            </div>
            <div className="grid md:grid-cols-2 gap-5 sm:gap-6">
              <div className="space-y-3 sm:space-y-4">
                <a href={TEL} className="block glass-card rounded-2xl p-4 sm:p-5 hover:border-[color:var(--gold)]/60 transition group">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-xl gradient-gold-bg flex items-center justify-center group-hover:scale-110 transition shrink-0">
                      <Phone className="h-5 w-5 text-background" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] sm:text-xs text-muted-foreground">{t("call_us")}</div>
                      <div className="font-semibold text-gold text-sm sm:text-base">+91 81249 95343</div>
                    </div>
                  </div>
                </a>
                <a href={WA} target="_blank" rel="noreferrer" className="block glass-card rounded-2xl p-4 sm:p-5 hover:border-[color:var(--gold)]/60 transition group">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-xl gradient-gold-bg flex items-center justify-center group-hover:scale-110 transition shrink-0">
                      <MessageCircle className="h-5 w-5 text-background" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] sm:text-xs text-muted-foreground">{t("whatsapp_label")}</div>
                      <div className="font-semibold text-gold text-sm sm:text-base">{t("chat_now")}</div>
                    </div>
                  </div>
                </a>
                <a href={INSTA} target="_blank" rel="noreferrer" className="block glass-card rounded-2xl p-4 sm:p-5 hover:border-[color:var(--gold)]/60 transition group">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-xl gradient-gold-bg flex items-center justify-center group-hover:scale-110 transition shrink-0">
                      <Instagram className="h-5 w-5 text-background" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] sm:text-xs text-muted-foreground">{t("instagram_label")}</div>
                      <div className="font-semibold text-gold text-sm sm:text-base">@madheshwara.mobiles</div>
                    </div>
                  </div>
                </a>
                <a href={MAPS} target="_blank" rel="noreferrer" className="block glass-card rounded-2xl p-4 sm:p-5 hover:border-[color:var(--gold)]/60 transition group">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-xl gradient-gold-bg flex items-center justify-center group-hover:scale-110 transition shrink-0">
                      <MapPin className="h-5 w-5 text-background" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] sm:text-xs text-muted-foreground">{t("location_label")}</div>
                      <div className="font-semibold text-gold text-sm sm:text-base">{t("address")}</div>
                    </div>
                  </div>
                </a>
              </div>
              <div className="rounded-2xl overflow-hidden glass-card min-h-[260px] sm:min-h-[320px]">
                <iframe
                  title="Sri Madheshwara Mobiles location"
                  src="https://www.google.com/maps?q=Mathur+Bus+Stand,+Krishnagiri+635203&output=embed"
                  className="w-full h-full min-h-[260px] sm:min-h-[320px] border-0"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative py-10 sm:py-12 px-4 border-t border-[color:var(--gold)]/15 mt-8">
          <div className="max-w-6xl mx-auto grid sm:grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <ShopLogo className="h-11 w-11 sm:h-12 sm:w-12" />
                <div>
                  <div className="font-display gradient-gold-text text-sm sm:text-base">SRI MADHESHWARA</div>
                  <div className="text-[10px] tracking-[0.3em] text-muted-foreground">MOBILES · SINCE 2011</div>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">{t("footer_tag")}</p>
            </div>
            <div>
              <div className="text-xs tracking-widest text-gold mb-3">{t("quick_links")}</div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {navLinks.map(l => (
                  <li key={l.key}><a href={l.href} className="hover:text-gold transition">{t(l.key)}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-xs tracking-widest text-gold mb-3">{t("hours_h")}</div>
              <div className="text-xs sm:text-sm text-muted-foreground space-y-1">
                <div>{t("hours_1")}</div>
                <div>{t("hours_2")}</div>
              </div>
              <div className="flex gap-3 mt-4">
                <a href={WA} target="_blank" rel="noreferrer" className="h-9 w-9 rounded-full glass-card flex items-center justify-center hover:bg-[color:var(--gold)]/10 transition"><MessageCircle className="h-4 w-4 text-gold" /></a>
                <a href={INSTA} target="_blank" rel="noreferrer" className="h-9 w-9 rounded-full glass-card flex items-center justify-center hover:bg-[color:var(--gold)]/10 transition"><Instagram className="h-4 w-4 text-gold" /></a>
                <a href={TEL} className="h-9 w-9 rounded-full glass-card flex items-center justify-center hover:bg-[color:var(--gold)]/10 transition"><Phone className="h-4 w-4 text-gold" /></a>
                <a href={MAPS} target="_blank" rel="noreferrer" className="h-9 w-9 rounded-full glass-card flex items-center justify-center hover:bg-[color:var(--gold)]/10 transition"><MapPin className="h-4 w-4 text-gold" /></a>
              </div>
            </div>
          </div>
          <div className="max-w-6xl mx-auto mt-8 sm:mt-10 pt-6 border-t border-[color:var(--gold)]/10 flex flex-col sm:flex-row gap-2 items-center justify-between text-[11px] sm:text-xs text-muted-foreground text-center">
            <div>© {new Date().getFullYear()} Sri Madheshwara Mobiles. {t("rights")}</div>
            <div className="flex items-center gap-4">
              <Link to="/admin" className="inline-flex items-center gap-1 text-muted-foreground hover:text-gold transition">
                <Lock className="h-3 w-3" /> Admin
              </Link>
              <span className="gradient-gold-text">Designed for futuristic mobile commerce.</span>
            </div>
          </div>
        </footer>

        <WhatsAppFab />
        <AIChatFab />
      </main>
    </>
  );
}
