import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { store } from "./store";
import { generateId, isValidCNPhone, normalizePhone } from "./utils";

const scrypt = promisify(scryptCb);

export const SESSION_COOKIE = "mta_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

export interface UserRecord {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  passwordHash: string;
  createdAt: string;
  linkedAccounts: { xiaomi: boolean; tesla: boolean };
  city?: string;
}

export type PublicUser = Omit<UserRecord, "passwordHash">;

export function toPublicUser(user: UserRecord): PublicUser {
  const { passwordHash: _passwordHash, ...rest } = user;
  void _passwordHash;
  return rest;
}

export function authSecret(): Uint8Array {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 16) {
    if (process.env.NODE_ENV === "production" && process.env.ALLOW_INSECURE_AUTH_SECRET !== "true") {
      throw new Error("AUTH_SECRET must be set (min 16 chars) in production");
    }
    return new TextEncoder().encode("mta-dev-secret-change-me-please-0000");
  }
  return new TextEncoder().encode(value);
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  const expected = Buffer.from(hash, "hex");
  return expected.length === derived.length && timingSafeEqual(derived, expected);
}

// Sessions are JWTs whose `jti` must also exist server-side, so logout (or an
// operator) can revoke a token before it expires.
export async function createSessionToken(userId: string): Promise<string> {
  const jti = generateId("S");
  await store.setValue(`session:${jti}`, { userId, createdAt: new Date().toISOString() }, SESSION_TTL_SECONDS);
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .setJti(jti)
    .sign(authSecret());
}

export async function readSessionToken(token: string | undefined): Promise<string | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, authSecret());
    if (typeof payload.sub !== "string" || typeof payload.jti !== "string") return null;
    const live = await store.getValue<{ userId: string }>(`session:${payload.jti}`);
    return live && live.userId === payload.sub ? payload.sub : null;
  } catch {
    return null;
  }
}

export async function revokeSessionToken(token: string | undefined): Promise<void> {
  if (!token) return;
  try {
    const { payload } = await jwtVerify(token, authSecret());
    if (typeof payload.jti === "string") await store.deleteValue(`session:${payload.jti}`);
  } catch {
    /* already invalid */
  }
}

// Hash of a random password; used so a login for an unknown identifier costs
// the same scrypt work as a wrong password (no timing-based account enumeration).
const DUMMY_HASH_PROMISE = hashPassword(randomBytes(24).toString("hex"));
export async function verifyPasswordOrDummy(password: string, stored: string | undefined): Promise<boolean> {
  if (stored) return verifyPassword(password, stored);
  await verifyPassword(password, await DUMMY_HASH_PROMISE);
  return false;
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production" && process.env.ALLOW_INSECURE_HTTP !== "true",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  };
}

export async function getCurrentUser(): Promise<UserRecord | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const userId = await readSessionToken(token);
  if (!userId) return null;
  return store.get<UserRecord>("users", userId);
}

export function normalizeIdentifier(input: string): { field: "phone" | "email"; value: string } | null {
  const trimmed = input.trim();
  if (isValidCNPhone(trimmed)) {
    return { field: "phone", value: normalizePhone(trimmed) };
  }
  if (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed)) {
    return { field: "email", value: trimmed.toLowerCase() };
  }
  return null;
}

export async function findUserByIdentifier(identifier: string): Promise<UserRecord | null> {
  const normalized = normalizeIdentifier(identifier);
  if (!normalized) return null;
  return store.getByLookup<UserRecord>("users", normalized.field, normalized.value);
}

export async function createUser(input: { name: string; identifier: string; password: string; city?: string }): Promise<UserRecord> {
  const normalized = normalizeIdentifier(input.identifier);
  if (!normalized) throw new Error("INVALID_IDENTIFIER");
  const user: UserRecord = {
    id: generateId("U"),
    name: input.name.trim(),
    passwordHash: await hashPassword(input.password),
    createdAt: new Date().toISOString(),
    linkedAccounts: { xiaomi: false, tesla: false },
    city: input.city,
    ...(normalized.field === "phone" ? { phone: normalized.value } : { email: normalized.value }),
  };
  // Reserve the identifier first (SET NX) so two concurrent sign-ups cannot both succeed.
  const claimed = await store.claimLookup("users", normalized.field, normalized.value, user.id);
  if (!claimed) throw new Error("USER_EXISTS");
  await store.put("users", user);
  return user;
}
