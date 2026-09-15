import { ImageResponse } from "next/og";

export const alt = "MI × TESLA ATELIER";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(135deg, #0b0c0e 0%, #171a20 55%, #2a2d33 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 22, letterSpacing: 8, opacity: 0.75 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 12, height: 12, borderRadius: 9999, background: "#ff6900" }} />
            XIAOMI EV
          </div>
          <span style={{ opacity: 0.5 }}>×</span>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 12, height: 12, borderRadius: 9999, background: "#e82127" }} />
            TESLA
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 96, fontWeight: 800, letterSpacing: 14, lineHeight: 1 }}>MI × TESLA</div>
          <div style={{ fontSize: 40, fontWeight: 500, letterSpacing: 18, marginTop: 18, opacity: 0.85 }}>ATELIER</div>
          <div style={{ fontSize: 28, marginTop: 36, opacity: 0.7 }}>Two electric pioneers. One bespoke house.</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 20, opacity: 0.6 }}>
          <span>Configure · Connect · Charge · Bespoke</span>
          <span>mitesla-atelier.com</span>
        </div>
      </div>
    ),
    size,
  );
}
