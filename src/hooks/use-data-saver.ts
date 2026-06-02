import { useEffect, useState } from "react";

/**
 * Detects when the user is on a constrained connection:
 *  - Save-Data header / navigator.connection.saveData
 *  - 2g / slow-2g effective type
 *  - prefers-reduced-data media query
 * Returns true → caller should skip heavy effects (canvas, autoplay video, large images).
 */
export function useDataSaver(): boolean {
  const [lowData, setLowData] = useState(false);

  useEffect(() => {
    if (typeof navigator === "undefined") return;
    const conn: any = (navigator as any).connection;
    const mql = typeof window.matchMedia === "function"
      ? window.matchMedia("(prefers-reduced-data: reduce)") : null;

    const evaluate = () => {
      const saveData = !!conn?.saveData;
      const slow = conn?.effectiveType && /2g/.test(conn.effectiveType);
      const reduced = !!mql?.matches;
      setLowData(saveData || slow || reduced);
    };
    evaluate();

    conn?.addEventListener?.("change", evaluate);
    mql?.addEventListener?.("change", evaluate);
    return () => {
      conn?.removeEventListener?.("change", evaluate);
      mql?.removeEventListener?.("change", evaluate);
    };
  }, []);

  return lowData;
}
