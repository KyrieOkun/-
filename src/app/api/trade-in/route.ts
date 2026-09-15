import { z } from "zod";
import { created, ok, parseBody, rateLimit } from "@/lib/api";
import { store } from "@/lib/store";
import { getCurrentUser } from "@/lib/auth";
import { generateId, isValidCNPhone } from "@/lib/utils";
import { estimateTradeIn, tradeInSchema } from "@/lib/trade-in";

const applySchema = tradeInSchema.extend({
  name: z.string().trim().min(1).max(40),
  phone: z.string().trim().refine(isValidCNPhone, "INVALID_PHONE"),
  targetVehicleSlug: z.string().optional(),
});

export async function POST(request: Request) {
  const limited = rateLimit(request, "trade-in", 20);
  if (limited) return limited;
  const raw = await request.clone().json().catch(() => null);
  const isApply = raw && typeof raw === "object" && "phone" in raw;
  if (isApply) {
    const parsed = await parseBody(request, applySchema);
    if ("error" in parsed) return parsed.error;
    const estimate = estimateTradeIn(parsed.data);
    const user = await getCurrentUser();
    const doc = { id: generateId("TI"), ownerId: user?.id, ...parsed.data, estimate, status: "pending-inspection", createdAt: new Date().toISOString() };
    await store.put("tradeIns", doc, { owner: user?.id });
    return created({ application: doc });
  }
  const parsed = await parseBody(request, tradeInSchema);
  if ("error" in parsed) return parsed.error;
  return ok({ estimate: estimateTradeIn(parsed.data) });
}

export const dynamic = "force-dynamic";
