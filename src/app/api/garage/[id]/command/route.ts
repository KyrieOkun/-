import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { store } from "@/lib/store";
import { fail, ok, parseBody, rateLimit } from "@/lib/api";
import { applyCommand, computeStatus, type GarageVehicle } from "@/lib/garage";

const schema = z.object({
  command: z.enum(["lock", "unlock", "climate_on", "climate_off", "flash", "charge_start", "charge_stop", "sentry_on", "sentry_off", "set_temp"]),
  temp: z.number().min(16).max(30).optional(),
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const limited = rateLimit(request, "garage-command", 60);
  if (limited) return limited;
  const user = await getCurrentUser();
  if (!user) return fail("UNAUTHORIZED", 401);
  const { id } = await params;
  const gv = await store.get<GarageVehicle>("garage", id);
  if (!gv || gv.ownerId !== user.id) return fail("NOT_FOUND", 404);
  const parsed = await parseBody(request, schema);
  if ("error" in parsed) return parsed.error;
  const updated = applyCommand(gv, parsed.data.command, { temp: parsed.data.temp });
  await store.put("garage", updated, { owner: user.id });
  return ok({ command: parsed.data.command, accepted: true, status: computeStatus(updated) });
}

export const dynamic = "force-dynamic";
