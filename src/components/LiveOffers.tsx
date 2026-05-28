import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Tag } from "lucide-react";

type Offer = { id: string; title: string; description: string; badge: string | null };

export const LiveOffers = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  useEffect(() => {
    supabase.from("offers").select("id,title,description,badge").eq("active", true)
      .order("created_at", { ascending: false }).limit(6)
      .then(({ data }) => setOffers((data as Offer[]) ?? []));
  }, []);
  if (offers.length === 0) return null;
  return (
    <section id="offers" className="relative py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="text-xs tracking-[0.4em] text-gold mb-3 inline-flex items-center gap-2"><Sparkles className="h-3 w-3" /> LIVE OFFERS</div>
          <h2 className="text-3xl md:text-4xl">Today's <span className="gradient-gold-text">Hot Deals</span></h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {offers.map(o => (
            <div key={o.id} className="relative glass-card rounded-2xl p-6 hover:-translate-y-1 hover:border-[color:var(--gold)]/60 transition overflow-hidden group">
              <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full gradient-gold-bg opacity-10 blur-2xl group-hover:opacity-30 transition" />
              {o.badge && (
                <div className="inline-flex items-center gap-1 text-[10px] tracking-widest gradient-gold-bg text-background px-2 py-1 rounded-full font-semibold mb-3">
                  <Tag className="h-3 w-3" /> {o.badge}
                </div>
              )}
              <h3 className="font-display text-lg gradient-gold-text mb-2">{o.title}</h3>
              <p className="text-sm text-muted-foreground">{o.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
