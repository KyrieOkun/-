import { fail, ok, rateLimit } from "@/lib/api";
import { store } from "@/lib/store";
import type { OrderRecord } from "@/lib/orders";
import { canViewOrder, toPublicOrder } from "@/lib/guest-orders";

/**
 * Deposit confirmation. In production this is replaced by the payment
 * provider's signed webhook (WeChat Pay / Alipay / card acquirer); the hosted
 * checkout return page must never be trusted on its own. Here the buyer's own
 * request stands in for the provider callback.
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const limited = rateLimit(request, "order-pay", 10);
  if (limited) return limited;
  const { id } = await params;
  const order = await store.get<OrderRecord>("orders", id);
  if (!order) return fail("NOT_FOUND", 404);
  if (!(await canViewOrder(order))) return fail("FORBIDDEN", 403);
  if (order.status !== "pending") return ok({ order: toPublicOrder(order) });
  const now = new Date().toISOString();
  const paid: OrderRecord = { ...order, status: "paid", paidAt: now, timeline: [...order.timeline, { status: "paid", at: now }] };
  await store.put("orders", paid, { owner: order.ownerId });
  return ok({ order: toPublicOrder(paid) });
}

export const dynamic = "force-dynamic";
