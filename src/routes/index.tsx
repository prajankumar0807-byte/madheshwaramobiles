import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Phone, MapPin, Instagram, MessageCircle, Sparkles, Shield, Wrench, Zap,
  Award, Clock, BadgeCheck, Battery, Headphones, Watch, Cable, Smartphone,
  Volume2, Usb, HardDrive, Star, ChevronRight, Mail,
} from "lucide-react";
import { ShopLogo } from "@/components/ShopLogo";
import { ParticleField } from "@/components/ParticleField";
import { TypingSlogan } from "@/components/TypingSlogan";
import { Counter } from "@/components/Counter";
import { WhatsAppFab } from "@/components/WhatsAppFab";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sri Madheshwara Mobiles — Latest Tech. Honest Prices." },
      { name: "description", content: "Trusted mobile store in Mathur, Krishnagiri since 2011. OPPO, Vivo, Redmi, Realme phones, premium accessories and fast repairs." },
      { property: "og:title", content: "Sri Madheshwara Mobiles" },
      { property: "og:description", content: "Latest Tech. Honest Prices. Fast Fixes. Best Devices." },
    ],
  }),
  component: Index,
});

const WA = "https://wa.me/918124995343";
const INSTA = "https://www.instagram.com/madheshwara.mobiles?igsh=d2c4OTFhdndzNmxh";
const MAPS = "https://maps.app.goo.gl/teuc6oYxZihVf3vH6";
const TEL = "tel:+918124995343";

const brands = ["OPPO", "Vivo", "Redmi", "Realme"];

const reasons = [
  { icon: BadgeCheck, title: "100% Genuine", desc: "Authentic devices & accessories, every time." },
  { icon: Zap, title: "Fast Service", desc: "Most repairs completed the same day." },
  { icon: Award, title: "Honest Pricing", desc: "Transparent rates with no hidden costs." },
  { icon: Wrench, title: "Expert Technicians", desc: "Years of certified repair experience." },
  { icon: Shield, title: "Warranty Support", desc: "Backed warranty on devices & repairs." },
  { icon: Clock, title: "Since 2011", desc: "A trusted name in Mathur, Krishnagiri." },
];

const categories = [
  { icon: Smartphone, name: "Smartphones" }, { icon: Cable, name: "Chargers & Cables" },
  { icon: Shield, name: "Tempered Glass" }, { icon: Battery, name: "Batteries" },
  { icon: Watch, name: "Smart Watches" }, { icon: Volume2, name: "Speakers" },
  { icon: Headphones, name: "Earbuds & Headphones" }, { icon: HardDrive, name: "Memory & Pendrives" },
  { icon: Zap, name: "Power Banks" }, { icon: Usb, name: "OTG & Type-C" },
];

const accessories = [
  "Chargers", "Cables", "Gorilla Tempered Glass", "UV Glass", "Batteries",
  "Back Pouch", "Flip Pouch", "Smart Watches", "Bluetooth Speakers", "Neckbands",
  "Earbuds", "Headphones", "Memory Cards", "Pendrives", "Power Banks",
  "Laptop Mouse", "Mobile Stand", "Car Chargers", "OTG Connectors", "Type-C Converters",
  "Cable Protectors", "Mobile Back Skins", "Stickers", "Screen Guards", "Keypad Mobiles",
];

const services = [
  { title: "Display Replacement", tag: "Smartphone" },
  { title: "Battery Replacement", tag: "Smartphone" },
  { title: "Speaker Repair", tag: "Smartphone" },
  { title: "Mic Repair", tag: "Smartphone" },
  { title: "Charging Port Repair", tag: "Smartphone" },
  { title: "Display Repair", tag: "Keypad" },
  { title: "Battery Replacement", tag: "Keypad" },
  { title: "Speaker & Mic Repair", tag: "Keypad" },
];

const testimonials = [
  { name: "Karthik R.", text: "Got my Vivo display replaced same day. Honest pricing and friendly staff. Highly recommend!", rating: 5 },
  { name: "Priya S.", text: "Bought a Redmi from here in 2019, still going strong. Now my whole family shops here.", rating: 5 },
  { name: "Manoj K.", text: "Best accessories collection in Mathur. Genuine products and unbeatable prices.", rating: 5 },
  { name: "Anitha M.", text: "Battery replaced in 30 minutes. Phone feels brand new. Thank you Madhesh sir!", rating: 5 },
];

function Index() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 1400);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      {/* Splash */}
      <div
        className={`fixed inset-0 z-[100] flex items-center justify-center bg-background transition-opacity duration-700 ${
          loaded ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <div className="flex flex-col items-center gap-6">
          <ShopLogo className="h-32 w-32 animate-float" />
          <div className="font-display text-sm tracking-[0.4em] gradient-gold-text">LOADING EXPERIENCE</div>
        </div>
      </div>

      <main className="relative min-h-screen text-foreground overflow-x-hidden">
        {/* Nav */}
        <nav className="fixed top-0 inset-x-0 z-40 glass border-b border-[color:var(--gold)]/15">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <a href="#top" className="flex items-center gap-3">
              <ShopLogo className="h-10 w-10" glow={false} />
              <div className="hidden sm:block leading-tight">
                <div className="font-display text-sm gradient-gold-text">SRI MADHESHWARA</div>
                <div className="text-[10px] tracking-[0.3em] text-muted-foreground">MOBILES · SINCE 2011</div>
              </div>
            </a>
            <div className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
              {["About", "Brands", "Accessories", "Services", "Gallery", "Contact"].map(l => (
                <a key={l} href={`#${l.toLowerCase()}`} className="hover:text-gold transition-colors">{l}</a>
              ))}
            </div>
            <a href={WA} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full gradient-gold-bg text-background text-sm font-semibold shadow-gold hover:scale-105 transition">
              <MessageCircle className="h-4 w-4" /> Chat
            </a>
          </div>
        </nav>

        {/* Hero */}
        <section id="top" className="relative min-h-screen pt-24 pb-16 flex items-center overflow-hidden">
          <ParticleField />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(232,196,108,0.18),transparent_60%)] pointer-events-none" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 grid md:grid-cols-2 gap-10 items-center w-full">
            <div className="animate-rise">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs tracking-widest text-gold mb-6">
                <Sparkles className="h-3 w-3" /> TRUSTED SINCE 2011
              </div>
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl leading-[1.05]">
                <span className="block text-foreground">SRI MADHESHWARA</span>
                <span className="block gradient-gold-text mt-2">MOBILES</span>
              </h1>
              <div className="mt-6 text-xl sm:text-2xl min-h-[2.5rem]">
                <TypingSlogan phrases={["Latest Tech. Honest Prices.", "Fast Fixes. Best Devices.", "Premium Mobile Showroom."]} />
              </div>
              <p className="mt-5 text-muted-foreground max-w-md">
                Your flagship mobile destination in Mathur, Krishnagiri — featuring OPPO, Vivo, Redmi, Realme & a complete accessories ecosystem.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#accessories" className="inline-flex items-center gap-2 px-5 py-3 rounded-full gradient-gold-bg text-background font-semibold shadow-gold hover:scale-105 transition">
                  Explore Products <ChevronRight className="h-4 w-4" />
                </a>
                <a href={WA} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-5 py-3 rounded-full glass text-foreground hover:border-[color:var(--gold)] transition">
                  <MessageCircle className="h-4 w-4 text-gold" /> WhatsApp
                </a>
                <a href={INSTA} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-5 py-3 rounded-full glass text-foreground hover:border-[color:var(--gold)] transition">
                  <Instagram className="h-4 w-4 text-gold" /> Instagram
                </a>
                <a href={MAPS} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-5 py-3 rounded-full glass text-foreground hover:border-[color:var(--gold)] transition">
                  <MapPin className="h-4 w-4 text-gold" /> Directions
                </a>
              </div>
            </div>
            <div className="relative flex justify-center items-center">
              <div className="absolute inset-0 gradient-gold-bg opacity-20 blur-3xl rounded-full" />
              <ShopLogo className="relative h-72 w-72 md:h-96 md:w-96 animate-float" />
              <div className="absolute top-10 right-2 glass-card rounded-2xl px-3 py-2 text-xs animate-float" style={{ animationDelay: "1s" }}>
                <div className="text-gold font-semibold">★ 4.9</div>
                <div className="text-muted-foreground">Customer Rating</div>
              </div>
              <div className="absolute bottom-10 left-0 glass-card rounded-2xl px-3 py-2 text-xs animate-float" style={{ animationDelay: "2s" }}>
                <div className="text-gold font-semibold">⚡ Same Day</div>
                <div className="text-muted-foreground">Repair Service</div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="relative py-16 border-y border-[color:var(--gold)]/15">
          <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
            <Counter to={15000} suffix="+" label="Customers Served" />
            <Counter to={8500} suffix="+" label="Repairs Completed" />
            <Counter to={14} suffix="+" label="Years of Trust" />
            <Counter to={300} suffix="+" label="Accessories" />
          </div>
        </section>

        {/* About */}
        <section id="about" className="relative py-24 px-4">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="text-xs tracking-[0.4em] text-gold mb-3">OUR STORY</div>
              <h2 className="text-3xl md:text-4xl mb-6">A Legacy of <span className="gradient-gold-text">Trust & Technology</span></h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Founded in 2011, Sri Madheshwara Mobiles has grown from a small neighborhood store into Mathur's most trusted mobile destination. We've built our reputation on three simple promises: genuine products, honest pricing, and lightning-fast service.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-8">
                Today, we serve thousands of happy customers across Krishnagiri with the latest smartphones, premium accessories, and expert repair services — all under one roof.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="glass-card rounded-xl p-4">
                  <div className="text-xs text-muted-foreground">OWNER</div>
                  <div className="font-semibold text-gold mt-1">Madhesh V.M</div>
                </div>
                <div className="glass-card rounded-xl p-4">
                  <div className="text-xs text-muted-foreground">MANAGER</div>
                  <div className="font-semibold text-gold mt-1">Malathi Madhesh</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="space-y-4">
                {[
                  { y: "2011", t: "The Beginning", d: "Sri Madheshwara Mobiles opens its doors in Mathur." },
                  { y: "2016", t: "Expanding Services", d: "Launched full-service mobile repair centre." },
                  { y: "2020", t: "Premium Brand Hub", d: "Authorized stockist for OPPO, Vivo, Redmi, Realme." },
                  { y: "Today", t: "Trusted Flagship", d: "Serving 15,000+ happy customers across Krishnagiri." },
                ].map((m, i) => (
                  <div key={i} className="glass-card rounded-2xl p-5 flex gap-4 hover:translate-x-1 transition">
                    <div className="font-display text-2xl gradient-gold-text shrink-0 w-20">{m.y}</div>
                    <div>
                      <div className="font-semibold">{m.t}</div>
                      <div className="text-sm text-muted-foreground">{m.d}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Why Us */}
        <section className="relative py-24 px-4 bg-gradient-to-b from-transparent via-[color:var(--card)]/30 to-transparent">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <div className="text-xs tracking-[0.4em] text-gold mb-3">WHY CHOOSE US</div>
              <h2 className="text-3xl md:text-4xl">The <span className="gradient-gold-text">Madheshwara</span> Promise</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {reasons.map((r, i) => (
                <div key={i} className="glass-card rounded-2xl p-6 hover:-translate-y-1 hover:border-[color:var(--gold)]/60 transition group">
                  <div className="h-12 w-12 rounded-xl gradient-gold-bg flex items-center justify-center mb-4 group-hover:scale-110 transition">
                    <r.icon className="h-6 w-6 text-background" />
                  </div>
                  <div className="font-semibold text-lg mb-1">{r.title}</div>
                  <div className="text-sm text-muted-foreground">{r.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Brands */}
        <section id="brands" className="relative py-24 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <div className="text-xs tracking-[0.4em] text-gold mb-3">FLAGSHIP BRANDS</div>
              <h2 className="text-3xl md:text-4xl">Top Brands, <span className="gradient-gold-text">All In One Place</span></h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {brands.map(b => (
                <div key={b} className="relative glass-card rounded-2xl p-8 flex items-center justify-center group overflow-hidden">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition gradient-gold-bg blur-2xl" />
                  <div className="relative font-display text-2xl md:text-3xl gradient-gold-text">{b}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Accessories */}
        <section id="accessories" className="relative py-24 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <div className="text-xs tracking-[0.4em] text-gold mb-3">ACCESSORIES SHOWCASE</div>
              <h2 className="text-3xl md:text-4xl">Everything Your Phone <span className="gradient-gold-text">Deserves</span></h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-10">
              {categories.map((c, i) => (
                <div key={i} className="glass-card rounded-2xl p-5 text-center hover:-translate-y-1 hover:border-[color:var(--gold)]/60 transition">
                  <c.icon className="h-7 w-7 text-gold mx-auto mb-3" />
                  <div className="text-sm font-medium">{c.name}</div>
                </div>
              ))}
            </div>
            <div className="glass rounded-3xl p-6 md:p-8">
              <div className="text-sm text-gold mb-4 font-semibold">Full Catalog</div>
              <div className="flex flex-wrap gap-2">
                {accessories.map(a => (
                  <span key={a} className="px-3 py-1.5 rounded-full text-xs glass-card hover:bg-[color:var(--gold)]/10 transition cursor-default">
                    {a}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Services */}
        <section id="services" className="relative py-24 px-4 bg-gradient-to-b from-transparent via-[color:var(--card)]/30 to-transparent">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <div className="text-xs tracking-[0.4em] text-gold mb-3">MOBILE SERVICES</div>
              <h2 className="text-3xl md:text-4xl">Expert Repairs, <span className="gradient-gold-text">Done Right</span></h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {services.map((s, i) => (
                <div key={i} className="glass-card rounded-2xl p-5 hover:border-[color:var(--gold)]/60 transition group">
                  <div className="flex items-center justify-between mb-3">
                    <Wrench className="h-5 w-5 text-gold" />
                    <span className="text-[10px] tracking-widest text-muted-foreground">{s.tag.toUpperCase()}</span>
                  </div>
                  <div className="font-semibold">{s.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">Most repairs same-day</div>
                </div>
              ))}
            </div>
            <div className="mt-10 text-center">
              <a href={WA} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full gradient-gold-bg text-background font-semibold shadow-gold hover:scale-105 transition">
                Book a Repair <ChevronRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="relative py-24 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <div className="text-xs tracking-[0.4em] text-gold mb-3">CUSTOMER LOVE</div>
              <h2 className="text-3xl md:text-4xl">What Our <span className="gradient-gold-text">Customers Say</span></h2>
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              {testimonials.map((t, i) => (
                <div key={i} className="glass-card rounded-2xl p-6">
                  <div className="flex gap-1 mb-3">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-[color:var(--gold)] text-gold" />
                    ))}
                  </div>
                  <p className="text-muted-foreground italic mb-4">"{t.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full gradient-gold-bg flex items-center justify-center text-background font-bold">
                      {t.name[0]}
                    </div>
                    <div className="font-semibold">{t.name}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Gallery */}
        <section id="gallery" className="relative py-24 px-4 bg-gradient-to-b from-transparent via-[color:var(--card)]/30 to-transparent">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <div className="text-xs tracking-[0.4em] text-gold mb-3">GALLERY</div>
              <h2 className="text-3xl md:text-4xl">Inside Our <span className="gradient-gold-text">Showroom</span></h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className={`relative rounded-2xl overflow-hidden glass-card ${i % 3 === 0 ? "row-span-2 aspect-[3/4]" : "aspect-square"}`}>
                  <div className="absolute inset-0 gradient-gold-bg opacity-10" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Smartphone className="h-10 w-10 text-gold/60" />
                  </div>
                  <div className="absolute bottom-2 left-2 right-2 text-[10px] tracking-widest text-muted-foreground">
                    SHOT {String(i + 1).padStart(2, "0")}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="relative py-24 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <div className="text-xs tracking-[0.4em] text-gold mb-3">VISIT US</div>
              <h2 className="text-3xl md:text-4xl">Let's <span className="gradient-gold-text">Connect</span></h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <a href={TEL} className="block glass-card rounded-2xl p-5 hover:border-[color:var(--gold)]/60 transition group">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl gradient-gold-bg flex items-center justify-center group-hover:scale-110 transition">
                      <Phone className="h-5 w-5 text-background" />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">CALL US</div>
                      <div className="font-semibold text-gold">+91 81249 95343</div>
                    </div>
                  </div>
                </a>
                <a href={WA} target="_blank" rel="noreferrer" className="block glass-card rounded-2xl p-5 hover:border-[color:var(--gold)]/60 transition group">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl gradient-gold-bg flex items-center justify-center group-hover:scale-110 transition">
                      <MessageCircle className="h-5 w-5 text-background" />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">WHATSAPP</div>
                      <div className="font-semibold text-gold">Chat Instantly</div>
                    </div>
                  </div>
                </a>
                <a href={INSTA} target="_blank" rel="noreferrer" className="block glass-card rounded-2xl p-5 hover:border-[color:var(--gold)]/60 transition group">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl gradient-gold-bg flex items-center justify-center group-hover:scale-110 transition">
                      <Instagram className="h-5 w-5 text-background" />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">INSTAGRAM</div>
                      <div className="font-semibold text-gold">@madheshwara.mobiles</div>
                    </div>
                  </div>
                </a>
                <a href={MAPS} target="_blank" rel="noreferrer" className="block glass-card rounded-2xl p-5 hover:border-[color:var(--gold)]/60 transition group">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl gradient-gold-bg flex items-center justify-center group-hover:scale-110 transition">
                      <MapPin className="h-5 w-5 text-background" />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">LOCATION</div>
                      <div className="font-semibold text-gold">Mathur Bus Stand, Krishnagiri – 635 203</div>
                    </div>
                  </div>
                </a>
              </div>
              <div className="rounded-2xl overflow-hidden glass-card min-h-[320px]">
                <iframe
                  title="Sri Madheshwara Mobiles location"
                  src="https://www.google.com/maps?q=Mathur+Bus+Stand,+Krishnagiri+635203&output=embed"
                  className="w-full h-full min-h-[320px] border-0"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative py-12 px-4 border-t border-[color:var(--gold)]/15 mt-8">
          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <ShopLogo className="h-12 w-12" />
                <div>
                  <div className="font-display gradient-gold-text">SRI MADHESHWARA</div>
                  <div className="text-[10px] tracking-[0.3em] text-muted-foreground">MOBILES · SINCE 2011</div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Latest Tech. Honest Prices. Fast Fixes. Best Devices.</p>
            </div>
            <div>
              <div className="text-xs tracking-widest text-gold mb-3">QUICK LINKS</div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {["About", "Brands", "Accessories", "Services", "Gallery", "Contact"].map(l => (
                  <li key={l}><a href={`#${l.toLowerCase()}`} className="hover:text-gold transition">{l}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-xs tracking-widest text-gold mb-3">BUSINESS HOURS</div>
              <div className="text-sm text-muted-foreground space-y-1">
                <div>Mon – Sat · 9:30 AM – 9:30 PM</div>
                <div>Sunday · 10:00 AM – 8:00 PM</div>
              </div>
              <div className="flex gap-3 mt-4">
                <a href={WA} target="_blank" rel="noreferrer" className="h-9 w-9 rounded-full glass-card flex items-center justify-center hover:bg-[color:var(--gold)]/10 transition"><MessageCircle className="h-4 w-4 text-gold" /></a>
                <a href={INSTA} target="_blank" rel="noreferrer" className="h-9 w-9 rounded-full glass-card flex items-center justify-center hover:bg-[color:var(--gold)]/10 transition"><Instagram className="h-4 w-4 text-gold" /></a>
                <a href={TEL} className="h-9 w-9 rounded-full glass-card flex items-center justify-center hover:bg-[color:var(--gold)]/10 transition"><Phone className="h-4 w-4 text-gold" /></a>
                <a href={MAPS} target="_blank" rel="noreferrer" className="h-9 w-9 rounded-full glass-card flex items-center justify-center hover:bg-[color:var(--gold)]/10 transition"><MapPin className="h-4 w-4 text-gold" /></a>
              </div>
            </div>
          </div>
          <div className="max-w-6xl mx-auto mt-10 pt-6 border-t border-[color:var(--gold)]/10 flex flex-col sm:flex-row gap-2 items-center justify-between text-xs text-muted-foreground">
            <div>© {new Date().getFullYear()} Sri Madheshwara Mobiles. All rights reserved.</div>
            <div className="gradient-gold-text">Designed for futuristic mobile commerce.</div>
          </div>
        </footer>

        <WhatsAppFab />
      </main>
    </>
  );
}
