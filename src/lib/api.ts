import { NextResponse } from "next/server";
import type { ZodType } from "zod";

export function ok<T>(data: T, init?: ResponseInit): NextResponse {
  return NextResponse.json({ ok: true, data }, { status: 200, ...init });
}

export function created<T>(data: T): NextResponse {
  return NextResponse.json({ ok: true, data }, { status: 201 });
}

export function fail(message: string, status = 400, details?: unknown): NextResponse {
  return NextResponse.json({ ok: false, error: { message, details } }, { status });
}

const MAX_BODY_BYTES = 32 * 1024;

export async function parseBody<T>(request: Request, schema: ZodType<T>): Promise<{ data: T } | { error: NextResponse }> {
  // Reject oversized bodies before parsing; every form on the site is well under 32 KB.
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > MAX_BODY_BYTES) return { error: fail("Payload too large", 413) };
  let json: unknown;
  try {
    const text = await request.text();
    if (text.length > MAX_BODY_BYTES) return { error: fail("Payload too large", 413) };
    json = JSON.parse(text);
  } catch {
    return { error: fail("Invalid JSON body", 400) };
  }
  const result = schema.safeParse(json);
  if (!result.success) {
    const issues = result.error.issues.map((i) => ({ path: i.path.join("."), message: i.message }));
    return { error: fail("Validation failed", 422, issues) };
  }
  return { data: result.data };
}

/**
 * Lightweight fixed-window rate limiter keyed by IP + bucket. Good enough as a
 * first line of defence for public forms; pair with an edge WAF in production.
 */
const buckets = new Map<string, { count: number; resetAt: number }>();
const MAX_BUCKETS = 10_000;

function evictExpired(now: number) {
  if (buckets.size < MAX_BUCKETS) return;
  for (const [key, entry] of buckets) if (entry.resetAt < now) buckets.delete(key);
}

export function rateLimit(request: Request, bucket: string, limit = 20, windowMs = 60_000): NextResponse | null {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip") ?? "local";
  const key = `${bucket}:${ip}`;
  const now = Date.now();
  evictExpired(now);
  const entry = buckets.get(key);
  if (!entry || entry.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }
  entry.count += 1;
  if (entry.count > limit) {
    return NextResponse.json(
      { ok: false, error: { message: "Too many requests" } },
      { status: 429, headers: { "Retry-After": String(Math.ceil((entry.resetAt - now) / 1000)) } },
    );
  }
  return null;
}
