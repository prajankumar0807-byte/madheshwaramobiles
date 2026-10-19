import { useEffect, useState } from "react";
import { requestClientErrorReport } from "@/components/ClientErrorReportListener";

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
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let retryCount = 0;
    let retryTimer: number | undefined;
    const check = () => {
      if (cancelled) return;
      if (stylesheetLoaded()) {
        setDegraded(false);
        setRetrying(false);
        document.getElementById("fallback-theme")?.remove();
        return;
      }

      const id = "fallback-theme";
      if (!document.getElementById(id)) {
        const style = document.createElement("style");
        style.id = id;
        style.textContent = FALLBACK_CSS;
        document.head.appendChild(style);
      }
      setDegraded(true);

      if (retryCount === 0) {
        const locale = window.localStorage.getItem("lang") === "ta" ? "ta" : "en";
        requestClientErrorReport({
          event_type: "stylesheet_transform",
          message: "Stylesheet did not apply expected utility styles; automatic recovery started.",
          stack: new Error("Stylesheet transform or load check failed").stack,
          pathname: window.location.pathname.slice(0, 300) || "/",
          locale,
          user_agent: window.navigator.userAgent.slice(0, 500),
        });
      }

      if (retryCount >= 6) {
        setRetrying(false);
        return;
      }

      setRetrying(true);
      retryCount += 1;
      const stylesheet = document.querySelector<HTMLLinkElement>('link[rel="stylesheet"][href*="styles"]');
      if (stylesheet) {
        const url = new URL(stylesheet.href);
        url.searchParams.set("smm-retry", String(retryCount));
        stylesheet.href = url.toString();
      }
      retryTimer = window.setTimeout(check, Math.min(500 * (2 ** (retryCount - 1)), 16_000));
    };
    const initialCheck = window.setTimeout(check, 400);
    return () => {
      cancelled = true;
      window.clearTimeout(initialCheck);
      if (retryTimer !== undefined) window.clearTimeout(retryTimer);
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
      <span>{retrying ? "Styles are recovering — a retry is in progress." : "Styles couldn’t load — showing a simplified version."}</span>
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
