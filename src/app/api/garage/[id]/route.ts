import { getCurrentUser } from "@/lib/auth";
import { store } from "@/lib/store";
import { fail, ok } from "@/lib/api";
import { computeStatus, type GarageVehicle } from "@/lib/garage";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Ctx) {
  const user = await getCurrentUser();
  if (!user) return fail("UNAUTHORIZED", 401);
  const { id } = await params;
  const gv = await store.get<GarageVehicle>("garage", id);
  if (!gv || gv.ownerId !== user.id) return fail("NOT_FOUND", 404);
  return ok({ vehicle: { ...gv, status: computeStatus(gv) } });
}

export async function DELETE(_request: Request, { params }: Ctx) {
  const user = await getCurrentUser();
  if (!user) return fail("UNAUTHORIZED", 401);
  const { id } = await params;
  const gv = await store.get<GarageVehicle>("garage", id);
  if (!gv || gv.ownerId !== user.id) return fail("NOT_FOUND", 404);
  await store.remove("garage", id, user.id);
  return ok({ removed: true });
}

export const dynamic = "force-dynamic";
