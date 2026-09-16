import { fail, ok } from "@/lib/api";
import { getVehicle } from "@/data/vehicles";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const vehicle = getVehicle(slug);
  if (!vehicle) return fail("NOT_FOUND", 404);
  return ok({ vehicle });
}
