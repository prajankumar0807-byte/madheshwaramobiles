import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Eye } from "lucide-react";
import { bumpVisit, getVisits } from "@/lib/visits.functions";

/** Silently increments the visit counter. Renders nothing. */
export const VisitorBump = () => {
  const bump = useServerFn(bumpVisit);
  useEffect(() => {
    bump({}).catch(() => {});
  }, [bump]);
  return null;
};

/** Admin-only visible visitor stat. */
export const VisitorStat = () => {
  const [count, setCount] = useState<number | null>(null);
  const get = useServerFn(getVisits);
  useEffect(() => {
    let cancelled = false;
    get().then((r) => { if (!cancelled) setCount(Number(r.visits ?? 0)); }).catch(() => {});
    return () => { cancelled = true; };
  }, [get]);
  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-xs sm:text-sm">
      <Eye className="h-4 w-4 text-gold" />
      <span className="text-muted-foreground">Total visitors</span>
      <span className="font-semibold gradient-gold-text tabular-nums">
        {count === null ? "…" : count.toLocaleString()}
      </span>
    </div>
  );
};

// Backwards-compatible default export (silent bumper, no UI on public pages)
export const VisitorCounter = VisitorBump;
