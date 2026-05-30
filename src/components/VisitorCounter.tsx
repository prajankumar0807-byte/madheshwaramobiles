import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Eye } from "lucide-react";
import { bumpVisit } from "@/lib/visits.functions";

export const VisitorCounter = () => {
  const [count, setCount] = useState<number | null>(null);
  const bump = useServerFn(bumpVisit);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { visits } = await bump({});
        if (!cancelled) setCount(visits);
      } catch {
        /* ignore */
      }
    })();
    return () => { cancelled = true; };
  }, [bump]);

  if (count === null) return null;
  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-xs sm:text-sm">
      <Eye className="h-4 w-4 text-gold" />
      <span className="text-muted-foreground">Visitors</span>
      <span className="font-semibold gradient-gold-text tabular-nums">{count.toLocaleString()}</span>
    </div>
  );
};
