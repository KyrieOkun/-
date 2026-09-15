import { z } from "zod";
import { SESSION_COOKIE, createSessionToken, createUser, sessionCookieOptions, toPublicUser } from "@/lib/auth";
import { created, fail, parseBody, rateLimit } from "@/lib/api";

const schema = z.object({
  name: z.string().trim().min(1).max(40),
  identifier: z.string().trim().min(5).max(120),
  password: z.string().min(8).max(128),
  city: z.string().trim().max(40).optional(),
});

export async function POST(request: Request) {
  const limited = rateLimit(request, "register", 8);
  if (limited) return limited;
  const parsed = await parseBody(request, schema);
  if ("error" in parsed) return parsed.error;
  try {
    const user = await createUser(parsed.data);
    const token = await createSessionToken(user.id);
    const res = created({ user: toPublicUser(user) });
    res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
    return res;
  } catch (err) {
    const code = err instanceof Error ? err.message : "UNKNOWN";
    if (code === "USER_EXISTS") return fail("USER_EXISTS", 409);
    if (code === "INVALID_IDENTIFIER") return fail("INVALID_IDENTIFIER", 422);
    return fail("REGISTER_FAILED", 500);
  }
}

export const dynamic = "force-dynamic";
