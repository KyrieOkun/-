import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { store } from "./store";
import { generateId } from "./utils";

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

function secret(): Uint8Array {
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

export async function createSessionToken(userId: string): Promise<string> {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .setJti(generateId("S"))
    .sign(secret());
}

export async function readSessionToken(token: string | undefined): Promise<string | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
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
  if (/^1[3-9]\d{9}$/.test(trimmed.replace(/\s|-/g, ""))) {
    return { field: "phone", value: trimmed.replace(/\s|-/g, "") };
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
  const existing = await store.getByLookup<UserRecord>("users", normalized.field, normalized.value);
  if (existing) throw new Error("USER_EXISTS");

  const user: UserRecord = {
    id: generateId("U"),
    name: input.name.trim(),
    passwordHash: await hashPassword(input.password),
    createdAt: new Date().toISOString(),
    linkedAccounts: { xiaomi: false, tesla: false },
    city: input.city,
    ...(normalized.field === "phone" ? { phone: normalized.value } : { email: normalized.value }),
  };
  await store.put("users", user);
  await store.setLookup("users", normalized.field, normalized.value, user.id);
  return user;
}
