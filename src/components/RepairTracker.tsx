import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Search, CheckCircle2, Circle, Wrench } from "lucide-react";
import { lookupRepair } from "@/lib/shop.functions";

const STAGES = ["Received", "Under Diagnosis", "Repairing", "Completed", "Ready for Delivery"];

type Job = {
  job_code: string;
  customer_name: string;
  device: string;
  issue: string | null;
  status: string;
  estimated_ready_at: string | null;
  updated_at: string;
};

export const RepairTracker = () => {
  const [q, setQ] = useState("");
  const [jobs, setJobs] = useState<Job[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const fn = useServerFn(lookupRepair);

  const onSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim().length < 3) return;
    setBusy(true); setErr(null);
    try {
      const { jobs: result } = await fn({ data: { query: q.trim() } });
      setJobs(result);
      if (result.length === 0) setErr("No repair found. Please double-check your job code or phone number.");
    } catch {
      setErr("Could not search right now. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section id="repair" className="relative py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <div className="text-xs tracking-[0.4em] text-gold mb-3">REPAIR TRACKER</div>
          <h2 className="text-3xl md:text-4xl">Track Your <span className="gradient-gold-text">Device Repair</span></h2>
          <p className="mt-3 text-muted-foreground text-sm">Enter your job code (e.g. SMMA12B3) or your phone number.</p>
        </div>

        <form onSubmit={onSearch} className="glass-card rounded-2xl p-3 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 flex items-center gap-3 px-4">
            <Search className="h-4 w-4 text-gold shrink-0" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Job code or phone number"
              className="flex-1 bg-transparent py-3 outline-none text-sm"
              maxLength={40}
            />
          </div>
          <button disabled={busy} className="px-6 py-3 rounded-xl gradient-gold-bg text-background font-semibold shadow-gold disabled:opacity-50">
            {busy ? "Searching…" : "Track Repair"}
          </button>
        </form>

        {err && <p className="mt-4 text-sm text-center text-muted-foreground">{err}</p>}

        {jobs && jobs.length > 0 && (
          <div className="mt-8 space-y-4">
            {jobs.map((j) => {
              const stageIdx = Math.max(0, STAGES.indexOf(j.status));
              const pct = ((stageIdx + 1) / STAGES.length) * 100;
              return (
                <div key={j.job_code} className="glass-card rounded-2xl p-6">
                  <div className="flex items-start justify-between mb-4 flex-wrap gap-2">
                    <div>
                      <div className="text-xs text-muted-foreground tracking-widest">JOB CODE</div>
                      <div className="font-display text-xl gradient-gold-text">{j.job_code}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">{j.customer_name}</div>
                      <div className="text-sm font-medium">{j.device}</div>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden mb-4">
                    <div className="h-full gradient-gold-bg shimmer transition-all duration-700" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="grid grid-cols-5 gap-1 text-[10px] text-center">
                    {STAGES.map((s, i) => (
                      <div key={s} className={`flex flex-col items-center gap-1 ${i <= stageIdx ? "text-gold" : "text-muted-foreground"}`}>
                        {i <= stageIdx ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                        <span className="leading-tight">{s}</span>
                      </div>
                    ))}
                  </div>
                  {j.estimated_ready_at && (
                    <div className="mt-4 text-xs text-muted-foreground flex items-center gap-2">
                      <Wrench className="h-3 w-3 text-gold" />
                      Estimated ready: {new Date(j.estimated_ready_at).toLocaleString()}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
