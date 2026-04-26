"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          backgroundColor: "#0a0a0a",
          color: "#fff",
          fontFamily: "system-ui, sans-serif",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          margin: 0,
        }}
      >
        <div style={{ textAlign: "center", maxWidth: 400, padding: "2rem" }}>
          <h2
            style={{
              fontSize: 20,
              letterSpacing: "0.15em",
              marginBottom: 8,
              fontWeight: 400,
            }}
          >
            SOMETHING WENT WRONG
          </h2>
          <p
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.4)",
              marginBottom: 24,
            }}
          >
            {error.message || "An unexpected error occurred."}
          </p>
          <button
            onClick={reset}
            style={{
              padding: "12px 32px",
              fontSize: 11,
              letterSpacing: "0.2em",
              background: "#fff",
              color: "#000",
              border: "1px solid #fff",
              cursor: "pointer",
            }}
          >
            TRY AGAIN
          </button>
        </div>
      </body>
    </html>
  );
}
