import { z } from "zod";
import { SESSION_COOKIE, createSessionToken, findUserByIdentifier, sessionCookieOptions, toPublicUser, verifyPassword } from "@/lib/auth";
import { fail, ok, parseBody, rateLimit } from "@/lib/api";

const schema = z.object({
  identifier: z.string().trim().min(5).max(120),
  password: z.string().min(1).max(128),
});

export async function POST(request: Request) {
  const limited = rateLimit(request, "login", 15);
  if (limited) return limited;
  const parsed = await parseBody(request, schema);
  if ("error" in parsed) return parsed.error;
  const user = await findUserByIdentifier(parsed.data.identifier);
  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return fail("INVALID_CREDENTIALS", 401);
  }
  const token = await createSessionToken(user.id);
  const res = ok({ user: toPublicUser(user) });
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
  return res;
}

export const dynamic = "force-dynamic";
