"use client";

import { useEffect } from "react";

// Catches errors thrown by the root layout itself, which app/error.tsx cannot reach.
// It replaces the entire document, so it must render its own <html> and <body> and
// cannot rely on globals.css classes being applied — styles are inline for that reason.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[app/global-error]", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#07090F",
          color: "#EAE6DF",
          fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
          padding: "1.25rem",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: "24rem" }}>
          <div style={{ fontSize: "2.25rem", marginBottom: "1.25rem" }}>⚠️</div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: "0 0 0.75rem" }}>Something went wrong</h1>
          <p style={{ color: "rgba(234,230,223,0.5)", fontSize: "0.875rem", lineHeight: 1.6, margin: "0 0 2rem" }}>
            We hit an unexpected problem. Please try again.
          </p>
          {error.digest && (
            <p style={{ color: "rgba(234,230,223,0.25)", fontSize: "0.75rem", fontFamily: "monospace", margin: "0 0 1.5rem" }}>
              Ref: {error.digest}
            </p>
          )}
          <button
            type="button"
            onClick={reset}
            style={{
              background: "#0ECFB7",
              color: "#07090F",
              fontWeight: 600,
              border: 0,
              padding: "0.875rem 1.5rem",
              borderRadius: "9999px",
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
