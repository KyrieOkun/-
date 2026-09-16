import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { timingSafeEqual } from "node:crypto";
import { authSecret, getCurrentUser } from "./auth";
import type { OrderRecord } from "./orders";
import { normalizePhone } from "./utils";

/**
 * Guest order access.
 *
 * Orders placed without an account are unlocked by a signed, httpOnly cookie
 * listing the order ids this browser created or looked up (order number +
 * buyer phone). The phone number itself never travels in a URL.
 */
export const GUEST_ORDERS_COOKIE = "mta_orders";
const GUEST_TTL_SECONDS = 60 * 60 * 24 * 30;
const MAX_IDS = 20;

interface GuestPayload {
  orders: string[];
}

export async function readGuestOrderIds(token: string | undefined): Promise<string[]> {
  if (!token) return [];
  try {
    const { payload } = await jwtVerify(token, authSecret());
    const ids = (payload as unknown as GuestPayload).orders;
    return Array.isArray(ids) ? ids.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export async function createGuestOrderToken(ids: string[]): Promise<string> {
  const unique = Array.from(new Set(ids)).slice(-MAX_IDS);
  return new SignJWT({ orders: unique })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${GUEST_TTL_SECONDS}s`)
    .sign(authSecret());
}

export function guestCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production" && process.env.ALLOW_INSECURE_HTTP !== "true",
    path: "/",
    maxAge: GUEST_TTL_SECONDS,
  };
}

/** Order ids the current request's browser may view without a session. */
export async function currentGuestOrderIds(): Promise<string[]> {
  const token = (await cookies()).get(GUEST_ORDERS_COOKIE)?.value;
  return readGuestOrderIds(token);
}

/** Constant-time comparison of two normalised phone numbers. */
export function phoneMatches(a: string, b: string): boolean {
  const x = Buffer.from(normalizePhone(a));
  const y = Buffer.from(normalizePhone(b));
  return x.length === y.length && timingSafeEqual(x, y);
}

/** What the API returns to the buyer: no internal owner id, masked identity data. */
export type PublicOrder = Omit<OrderRecord, "ownerId" | "buyer"> & {
  buyer: { name: string; phoneMasked: string; idType: string; city: string };
};

export function toPublicOrder(order: OrderRecord): PublicOrder {
  const { ownerId: _ownerId, buyer, ...rest } = order;
  void _ownerId;
  return {
    ...rest,
    buyer: {
      name: buyer.name,
      phoneMasked: buyer.phone.replace(/^(\d{3})\d{4}(\d{4})$/, "$1****$2"),
      idType: buyer.idType,
      city: buyer.city,
    },
  };
}

/** Session owner or a browser holding the guest grant for this order. */
export async function canViewOrder(order: OrderRecord): Promise<boolean> {
  const user = await getCurrentUser();
  if (user && order.ownerId === user.id) return true;
  const guestIds = await currentGuestOrderIds();
  return guestIds.includes(order.id);
}
