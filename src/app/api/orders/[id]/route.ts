import { NextRequest } from "next/server";
import { fail, ok, rateLimit } from "@/lib/api";
import { store } from "@/lib/store";
import type { OrderRecord } from "@/lib/orders";
import { canViewOrder, toPublicOrder } from "@/lib/guest-orders";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const limited = rateLimit(request, "order-read", 60);
  if (limited) return limited;
  const { id } = await params;
  const order = await store.get<OrderRecord>("orders", id);
  if (!order) return fail("NOT_FOUND", 404);
  if (!(await canViewOrder(order))) return fail("FORBIDDEN", 403);
  return ok({ order: toPublicOrder(order) });
}

export const dynamic = "force-dynamic";
