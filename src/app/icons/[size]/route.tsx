import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

const SIZES = new Set([48, 72, 96, 128, 144, 180, 192, 256, 384, 512]);

export async function GET(request: NextRequest, { params }: { params: Promise<{ size: string }> }) {
  const { size: raw } = await params;
  const size = Number(raw);
  if (!SIZES.has(size)) return new Response("Not found", { status: 404 });
  const maskable = request.nextUrl.searchParams.get("maskable") === "1";
  const pad = maskable ? size * 0.18 : size * 0.1;
  return new ImageResponse(
    (
      <div
        style={{
          width: size,
          height: size,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0b0c0e",
          borderRadius: maskable ? 0 : size * 0.22,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: pad, color: "white", fontFamily: "sans-serif" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: size * 0.05, fontSize: size * 0.22, fontWeight: 800, letterSpacing: size * 0.02 }}>
            <span>MI</span>
            <span style={{ fontSize: size * 0.12, opacity: 0.6, fontWeight: 300 }}>×</span>
            <span>T</span>
          </div>
          <div style={{ display: "flex", gap: size * 0.04, marginTop: size * 0.06 }}>
            <div style={{ width: size * 0.09, height: size * 0.09, borderRadius: 9999, background: "#ff6900" }} />
            <div style={{ width: size * 0.09, height: size * 0.09, borderRadius: 9999, background: "#e82127" }} />
          </div>
        </div>
      </div>
    ),
    { width: size, height: size, headers: { "Cache-Control": "public, max-age=31536000, immutable" } },
  );
}
