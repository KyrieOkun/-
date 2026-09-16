import { ok } from "@/lib/api";
import { store } from "@/lib/store";

/**
 * Public liveness probe. Deployment details (store driver, version) are only
 * disclosed to callers presenting the internal token, so an unauthenticated
 * request cannot learn that the site is running on the volatile store.
 */
export async function GET(request: Request) {
  const token = process.env.HEALTH_TOKEN;
  const authorised = !!token && request.headers.get("x-health-token") === token;
  return ok({
    status: "ok",
    time: new Date().toISOString(),
    ...(authorised ? { store: store.driverName(), version: process.env.NEXT_PUBLIC_APP_VERSION ?? "1.0.0" } : {}),
  });
}

export const dynamic = "force-dynamic";
