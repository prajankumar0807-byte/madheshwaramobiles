import { useEffect, useRef, useState } from "react";

export const Counter = ({ to, suffix = "", label }: { to: number; suffix?: string; label: string }) => {
  const [v, setV] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          const start = performance.now();
          const dur = 1600;
          const step = (t: number) => {
            const p = Math.min(1, (t - start) / dur);
            setV(Math.floor(to * (1 - Math.pow(1 - p, 3))));
            if (p < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
          obs.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [to]);
  return (
    <div ref={ref} className="text-center">
      <div className="font-display text-3xl sm:text-4xl md:text-5xl gradient-gold-text">
        {v.toLocaleString()}{suffix}
      </div>
      <div className="mt-2 text-xs sm:text-sm uppercase tracking-widest text-muted-foreground">{label}</div>
    </div>
  );
};
