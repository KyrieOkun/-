import { z } from "zod";
import { created, fail, ok, parseBody, rateLimit } from "@/lib/api";
import { store } from "@/lib/store";
import { getVehicle } from "@/data/vehicles";
import { stores } from "@/data/site";
import { computeQuote } from "@/lib/pricing";
import { getCurrentUser } from "@/lib/auth";
import { generateId, isValidCNPhone } from "@/lib/utils";
import type { OrderRecord } from "@/lib/orders";

const schema = z.object({
  vehicleSlug: z.string().min(1),
  trimId: z.string().optional(),
  paintId: z.string().optional(),
  wheelId: z.string().optional(),
  interiorId: z.string().optional(),
  extraIds: z.array(z.string()).default([]),
  buyer: z.object({
    name: z.string().trim().min(1).max(40),
    phone: z.string().trim().refine(isValidCNPhone, "INVALID_PHONE"),
    idType: z.enum(["id-card", "passport", "business"]),
    idLast4: z.string().trim().regex(/^[0-9A-Za-z]{4}$/),
    city: z.string().trim().min(1).max(40),
  }),
  deliveryStoreId: z.string().min(1),
  financing: z.enum(["cash", "loan", "lease"]),
  payment: z.enum(["wechat", "alipay", "card"]),
  agree: z.literal(true),
});

export async function POST(request: Request) {
  const limited = rateLimit(request, "orders", 10);
  if (limited) return limited;
  const parsed = await parseBody(request, schema);
  if ("error" in parsed) return parsed.error;
  const vehicle = getVehicle(parsed.data.vehicleSlug);
  if (!vehicle) return fail("Unknown vehicle", 404);
  if (vehicle.availability === "overseas") return fail("NOT_ORDERABLE", 422);
  if (!stores.some((s) => s.id === parsed.data.deliveryStoreId)) return fail("Unknown delivery centre", 422);
  const quote = computeQuote(vehicle, parsed.data);
  const user = await getCurrentUser();
  const now = new Date().toISOString();
  const order: OrderRecord = {
    id: generateId(vehicle.brand === "xiaomi" ? "MI" : "TS"),
    ownerId: user?.id,
    vehicleSlug: vehicle.slug,
    selection: {
      trimId: quote.trim.id,
      paintId: quote.paint.id,
      wheelId: quote.wheel.id,
      interiorId: quote.interior.id,
      extraIds: quote.extras.map((e) => e.id),
    },
    buyer: parsed.data.buyer,
    deliveryStoreId: parsed.data.deliveryStoreId,
    financing: parsed.data.financing,
    payment: parsed.data.payment,
    quote: {
      subtotal: quote.subtotal,
      purchaseTax: quote.purchaseTax,
      total: quote.total,
      deposit: quote.deposit,
      monthly: quote.monthly,
      deliveryWeeks: quote.deliveryWeeks,
    },
    // Payment is captured by the PSP webhook in production; the hosted checkout
    // returns synchronously here so the deposit is recorded as paid immediately.
    status: "paid",
    timeline: [
      { status: "pending", at: now },
      { status: "paid", at: now },
    ],
    createdAt: now,
    paidAt: now,
  };
  await store.put("orders", order, { owner: user?.id });
  await store.setLookup("orders", "phone", `${order.id}:${parsed.data.buyer.phone}`, order.id);
  return created({ order });
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return fail("UNAUTHORIZED", 401);
  const orders = await store.list<OrderRecord>("orders", user.id);
  orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return ok({ orders });
}

export const dynamic = "force-dynamic";
