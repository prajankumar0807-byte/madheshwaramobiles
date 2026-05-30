import { useState } from "react";
import { z } from "zod";
import { Send, ShieldCheck, Sparkles } from "lucide-react";

const WA_NUMBER = "918124995343";

const schema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(60),
  phone: z.string().trim().regex(/^[+\d][\d\s-]{6,15}$/, "Enter a valid phone"),
  interest: z.string().trim().max(80).optional(),
});

export const LeadCapture = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [interest, setInterest] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ name, phone, interest });
    if (!parsed.success) {
      setErr(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    setErr(null);
    const text =
      `Hello Sri Madheshwara Mobiles! 👋\n\n` +
      `*Name:* ${parsed.data.name}\n` +
      `*Phone:* ${parsed.data.phone}\n` +
      (parsed.data.interest ? `*Interested in:* ${parsed.data.interest}\n` : "") +
      `\nPlease share details & best offer.`;
    const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <section id="enquire" className="relative py-16 sm:py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="relative glass-card rounded-3xl p-6 sm:p-10 overflow-hidden">
          <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full gradient-gold-bg blur-3xl opacity-25 pointer-events-none" />
          <div className="relative grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-[10px] tracking-[0.3em] text-gold mb-3">
                <Sparkles className="h-3 w-3" /> INSTANT QUOTE
              </div>
              <h3 className="font-display text-2xl sm:text-3xl leading-tight">
                Get a <span className="gradient-gold-text">Personal Quote</span> on WhatsApp
              </h3>
              <p className="mt-3 text-sm text-muted-foreground">
                Share your name & number — our team will reply instantly with the best price,
                EMI options and stock availability.
              </p>
              <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-gold" />
                Your details stay private. We only message you back on WhatsApp.
              </div>
            </div>
            <form onSubmit={submit} className="space-y-3">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                maxLength={60}
                className="w-full rounded-xl bg-secondary/60 border border-[color:var(--gold)]/20 px-4 py-3 text-sm outline-none focus:border-[color:var(--gold)] transition"
              />
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone number"
                inputMode="tel"
                maxLength={16}
                className="w-full rounded-xl bg-secondary/60 border border-[color:var(--gold)]/20 px-4 py-3 text-sm outline-none focus:border-[color:var(--gold)] transition"
              />
              <input
                value={interest}
                onChange={(e) => setInterest(e.target.value)}
                placeholder="Interested in (e.g. OPPO F33, screen repair) — optional"
                maxLength={80}
                className="w-full rounded-xl bg-secondary/60 border border-[color:var(--gold)]/20 px-4 py-3 text-sm outline-none focus:border-[color:var(--gold)] transition"
              />
              {err && <p className="text-xs text-destructive">{err}</p>}
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl gradient-gold-bg text-background font-semibold shadow-gold hover:scale-[1.02] transition"
              >
                <Send className="h-4 w-4" /> Send on WhatsApp
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
