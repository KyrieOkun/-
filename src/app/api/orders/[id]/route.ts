import { NextRequest } from "next/server";
import { fail, ok, rateLimit } from "@/lib/api";
import { store } from "@/lib/store";
import { getCurrentUser } from "@/lib/auth";
import type { OrderRecord } from "@/lib/orders";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Guest lookups are keyed by order id + phone; throttle to make enumeration impractical.
  const limited = rateLimit(request, "order-lookup", 30);
  if (limited) return limited;
  const { id } = await params;
  const order = await store.get<OrderRecord>("orders", id);
  if (!order) return fail("NOT_FOUND", 404);
  const user = await getCurrentUser();
  const phone = request.nextUrl.searchParams.get("phone");
  const isOwner = user && order.ownerId === user.id;
  const phoneMatches = phone && phone === order.buyer.phone;
  if (!isOwner && !phoneMatches) return fail("FORBIDDEN", 403);
  return ok({ order });
}

export const dynamic = "force-dynamic";
