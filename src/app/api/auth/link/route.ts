import { z } from "zod";
import { getCurrentUser, toPublicUser } from "@/lib/auth";
import { store } from "@/lib/store";
import { fail, ok, parseBody } from "@/lib/api";

const schema = z.object({ provider: z.enum(["xiaomi", "tesla"]), linked: z.boolean() });

/**
 * In production this endpoint completes the OAuth 2.0 authorization-code flow
 * against Xiaomi Account / Tesla Account and stores the refresh token.
 */
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return fail("UNAUTHORIZED", 401);
  const parsed = await parseBody(request, schema);
  if ("error" in parsed) return parsed.error;
  const updated = { ...user, linkedAccounts: { ...user.linkedAccounts, [parsed.data.provider]: parsed.data.linked } };
  await store.put("users", updated);
  return ok({ user: toPublicUser(updated) });
}

export const dynamic = "force-dynamic";
