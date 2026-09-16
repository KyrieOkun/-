import { z } from "zod";
import { fail, ok, parseBody, rateLimit } from "@/lib/api";
import { getVehicle } from "@/data/vehicles";
import { computeQuote } from "@/lib/pricing";

const schema = z.object({
  vehicleSlug: z.string().min(1),
  trimId: z.string().optional(),
  paintId: z.string().optional(),
  wheelId: z.string().optional(),
  interiorId: z.string().optional(),
  extraIds: z.array(z.string().max(40)).max(32).default([]),
});

export async function POST(request: Request) {
  const limited = rateLimit(request, "quote", 60);
  if (limited) return limited;
  const parsed = await parseBody(request, schema);
  if ("error" in parsed) return parsed.error;
  const vehicle = getVehicle(parsed.data.vehicleSlug);
  if (!vehicle) return fail("NOT_FOUND", 404);
  const quote = computeQuote(vehicle, parsed.data);
  return ok({
    quote: {
      trimId: quote.trim.id,
      paintId: quote.paint.id,
      wheelId: quote.wheel.id,
      interiorId: quote.interior.id,
      extraIds: quote.extras.map((e) => e.id),
      vehiclePrice: quote.vehiclePrice,
      optionsTotal: quote.optionsTotal,
      subtotal: quote.subtotal,
      purchaseTax: quote.purchaseTax,
      total: quote.total,
      deposit: quote.deposit,
      monthly: quote.monthly,
      rangeKm: quote.rangeKm,
      deliveryWeeks: quote.deliveryWeeks,
    },
  });
}
