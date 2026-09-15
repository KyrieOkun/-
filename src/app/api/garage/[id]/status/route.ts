import { getCurrentUser } from "@/lib/auth";
import { store } from "@/lib/store";
import { fail, ok } from "@/lib/api";
import { computeStatus, type GarageVehicle } from "@/lib/garage";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return fail("UNAUTHORIZED", 401);
  const { id } = await params;
  const gv = await store.get<GarageVehicle>("garage", id);
  if (!gv || gv.ownerId !== user.id) return fail("NOT_FOUND", 404);
  return ok({ status: computeStatus(gv) });
}

export const dynamic = "force-dynamic";
