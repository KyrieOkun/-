import { cookies } from "next/headers";
import { SESSION_COOKIE, revokeSessionToken } from "@/lib/auth";
import { ok } from "@/lib/api";

export async function POST() {
  await revokeSessionToken((await cookies()).get(SESSION_COOKIE)?.value);
  const res = ok({ loggedOut: true });
  res.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}

export const dynamic = "force-dynamic";
