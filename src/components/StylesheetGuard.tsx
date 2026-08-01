import { useEffect, useState } from "react";

/**
 * Detects a failed / un-transformed stylesheet and injects a minimal readable
 * fallback theme so the site stays usable instead of rendering unstyled.
 */
const FALLBACK_CSS = `
:root { color-scheme: dark; }
body { margin:0; background:#0a0a0a; color:#f2ead6; font-family: system-ui, -apple-system, "Segoe UI", sans-serif; line-height:1.6; }
img, video { max-width:100%; height:auto; }
h1,h2,h3 { color:#e8c66a; line-height:1.25; }
a { color:#e8c66a; }
button, a { cursor:pointer; }
section { padding: 28px 16px; max-width: 960px; margin: 0 auto; }
button { border-radius:8px; border:1px solid #e8c66a; background:#e8c66a; color:#121212; padding:10px 16px; font-weight:600; }
input, textarea, select { width:100%; box-sizing:border-box; padding:10px; border-radius:8px; border:1px solid #4a4638; }
`;

function stylesheetLoaded() {
  if (typeof document === "undefined") return true;
  const probe = document.createElement("div");
  probe.className = "hidden";
  probe.setAttribute("aria-hidden", "true");
  document.body.appendChild(probe);
  const display = getComputedStyle(probe).display;
  probe.remove();
  // Tailwind's `.hidden` => display:none. If it's not applied, CSS never landed.
  return display === "none";
}

export function StylesheetGuard() {
  const [degraded, setDegraded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const check = () => {
      if (cancelled) return;
      if (!stylesheetLoaded()) {
        const id = "fallback-theme";
        if (!document.getElementById(id)) {
          const style = document.createElement("style");
          style.id = id;
          style.textContent = FALLBACK_CSS;
          document.head.appendChild(style);
        }
        setDegraded(true);
      }
    };
    // Give the stylesheet a beat to arrive, then re-check once more.
    const t1 = window.setTimeout(check, 400);
    const t2 = window.setTimeout(check, 2500);
    return () => {
      cancelled = true;
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);

  if (!degraded) return null;

  return (
    <div
      role="status"
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        background: "#1a1408",
        color: "#f5e6b8",
        borderTop: "1px solid #e8c66a",
        padding: "10px 14px",
        fontSize: 13,
        fontFamily: "system-ui, sans-serif",
        display: "flex",
        gap: 12,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <span>Styles couldn&apos;t load — showing a simplified version.</span>
      <button
        onClick={() => window.location.reload()}
        style={{
          border: "1px solid #e8c66a",
          background: "transparent",
          color: "#e8c66a",
          borderRadius: 6,
          padding: "4px 10px",
        }}
      >
        Reload
      </button>
    </div>
  );
}
