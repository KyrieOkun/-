import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: 180, height: 180, display: "flex", alignItems: "center", justifyContent: "center", background: "#0b0c0e", color: "white", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, fontSize: 40, fontWeight: 800, letterSpacing: 3 }}>
            <span>MI</span>
            <span style={{ fontSize: 20, opacity: 0.6, fontWeight: 300 }}>×</span>
            <span>T</span>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <div style={{ width: 16, height: 16, borderRadius: 9999, background: "#ff6900" }} />
            <div style={{ width: 16, height: 16, borderRadius: 9999, background: "#e82127" }} />
          </div>
        </div>
      </div>
    ),
    size,
  );
}
