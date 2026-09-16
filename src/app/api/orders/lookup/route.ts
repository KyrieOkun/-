import { z } from "zod";
import { fail, ok, parseBody, rateLimit } from "@/lib/api";
import { store } from "@/lib/store";
import type { OrderRecord } from "@/lib/orders";
import { isValidCNPhone, normalizePhone } from "@/lib/utils";
import { GUEST_ORDERS_COOKIE, createGuestOrderToken, currentGuestOrderIds, guestCookieOptions, phoneMatches, toPublicOrder } from "@/lib/guest-orders";

const schema = z.object({
  orderId: z.string().trim().min(6).max(40),
  phone: z.string().trim().refine(isValidCNPhone, "INVALID_PHONE").transform(normalizePhone),
});

/**
 * Order number + buyer phone unlocks a guest order for this browser. The phone
 * is posted once (never in a URL) and the grant is stored in a signed cookie.
 */
export async function POST(request: Request) {
  const limited = rateLimit(request, "order-lookup", 10);
  if (limited) return limited;
  const parsed = await parseBody(request, schema);
  if ("error" in parsed) return parsed.error;
  const order = await store.get<OrderRecord>("orders", parsed.data.orderId.toUpperCase());
  if (!order || !phoneMatches(order.buyer.phone, parsed.data.phone)) return fail("NOT_FOUND", 404);
  const guestIds = await currentGuestOrderIds();
  const res = ok({ order: toPublicOrder(order) });
  res.cookies.set(GUEST_ORDERS_COOKIE, await createGuestOrderToken([...guestIds, order.id]), guestCookieOptions());
  return res;
}

export const dynamic = "force-dynamic";
