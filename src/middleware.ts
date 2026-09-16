import { NextResponse, type NextRequest } from "next/server";

const MUTATING = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/**
 * Cross-site request forgery guard for the JSON API: state-changing requests
 * must come from this origin. Browsers always send `Sec-Fetch-Site` (and
 * usually `Origin`) on cross-origin requests; server-to-server callers without
 * either header are allowed through (they carry no ambient cookies anyway).
 */
export function middleware(request: NextRequest) {
  if (!MUTATING.has(request.method)) return NextResponse.next();
  const site = request.headers.get("sec-fetch-site");
  if (site && site !== "same-origin" && site !== "none") {
    return NextResponse.json({ ok: false, error: { message: "Cross-site request rejected" } }, { status: 403 });
  }
  const origin = request.headers.get("origin");
  if (origin) {
    const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
    let originHost: string | null = null;
    try {
      originHost = new URL(origin).host;
    } catch {
      originHost = null;
    }
    if (!host || originHost !== host) {
      return NextResponse.json({ ok: false, error: { message: "Cross-site request rejected" } }, { status: 403 });
    }
  }
  return NextResponse.next();
}

export const config = { matcher: "/api/:path*" };
