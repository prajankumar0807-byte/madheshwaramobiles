import React from "react";

type Props = { children: React.ReactNode };
type State = { error: Error | null };

const FALLBACK_STYLE: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "24px",
  background: "#0a0a0a",
  color: "#f5e6b8",
  fontFamily: "system-ui, sans-serif",
  textAlign: "center",
};

/**
 * Top-level client error boundary. Uses inline styles only, so it still renders
 * correctly even when the stylesheet failed to load or transform.
 */
export class AppErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: unknown) {
    console.error("[AppErrorBoundary]", error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div style={FALLBACK_STYLE}>
        <div style={{ maxWidth: 460 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: "#e8c66a" }}>
            SRI MADHESHWARA MOBILES
          </h1>
          <p style={{ marginTop: 12, fontSize: 15, lineHeight: 1.6, color: "#cfc7b0" }}>
            Something went wrong while loading this part of the site. The shop is still
            reachable — call or message us any time.
          </p>
          <div style={{ marginTop: 20, display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => this.setState({ error: null })}
              style={{
                padding: "10px 16px",
                borderRadius: 8,
                border: "1px solid #e8c66a",
                background: "#e8c66a",
                color: "#121212",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Try again
            </button>
            <a
              href="/"
              style={{
                padding: "10px 16px",
                borderRadius: 8,
                border: "1px solid #55503f",
                color: "#f5e6b8",
                textDecoration: "none",
              }}
            >
              Go home
            </a>
          </div>
        </div>
      </div>
    );
  }
}
