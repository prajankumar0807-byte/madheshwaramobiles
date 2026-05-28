import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Star, Lock, CheckCircle2 } from "lucide-react";
import { submitFeedback } from "@/lib/shop.functions";

export const FeedbackForm = () => {
  const [rating, setRating] = useState(5);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const fn = useServerFn(submitFeedback);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim().length < 3) return;
    setBusy(true);
    try {
      await fn({ data: { name: name || undefined, phone: phone || undefined, rating, message: message.trim() } });
      setDone(true);
    } finally { setBusy(false); }
  };

  return (
    <section id="feedback" className="relative py-24 px-4 bg-gradient-to-b from-transparent via-[color:var(--card)]/30 to-transparent">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="text-xs tracking-[0.4em] text-gold mb-3 inline-flex items-center gap-2"><Lock className="h-3 w-3" /> PRIVATE FEEDBACK</div>
          <h2 className="text-3xl md:text-4xl">We'd Love Your <span className="gradient-gold-text">Honest Feedback</span></h2>
          <p className="mt-3 text-sm text-muted-foreground">Sent privately to the owner. Other customers will not see it.</p>
        </div>

        {done ? (
          <div className="glass-card rounded-2xl p-8 text-center">
            <CheckCircle2 className="h-12 w-12 text-gold mx-auto mb-3" />
            <div className="font-display text-xl gradient-gold-text">Thank you!</div>
            <p className="text-sm text-muted-foreground mt-2">Your feedback was sent directly to Madhesh sir.</p>
          </div>
        ) : (
          <form onSubmit={submit} className="glass-card rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-center gap-2">
              {[1,2,3,4,5].map(n => (
                <button key={n} type="button" onClick={() => setRating(n)}>
                  <Star className={`h-8 w-8 transition ${n <= rating ? "fill-[color:var(--gold)] text-gold" : "text-muted-foreground"}`} />
                </button>
              ))}
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name (optional)" maxLength={80}
                className="rounded-xl bg-secondary/60 border border-[color:var(--gold)]/20 px-4 py-3 text-sm outline-none focus:border-[color:var(--gold)]" />
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone (optional)" maxLength={20}
                className="rounded-xl bg-secondary/60 border border-[color:var(--gold)]/20 px-4 py-3 text-sm outline-none focus:border-[color:var(--gold)]" />
            </div>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Tell us how we did…"
              rows={4} maxLength={1000} required minLength={3}
              className="w-full rounded-xl bg-secondary/60 border border-[color:var(--gold)]/20 px-4 py-3 text-sm outline-none focus:border-[color:var(--gold)] resize-none" />
            <button disabled={busy} className="w-full py-3 rounded-xl gradient-gold-bg text-background font-semibold shadow-gold disabled:opacity-50">
              {busy ? "Sending…" : "Send Private Feedback"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
};
