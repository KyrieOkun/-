import { getCurrentUser } from "@/lib/auth";
import { store } from "@/lib/store";
import { fail, ok } from "@/lib/api";
import type { SharedKey } from "@/lib/orders";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return fail("UNAUTHORIZED", 401);
  const { id } = await params;
  const key = await store.get<SharedKey>("keys", id);
  if (!key || key.ownerId !== user.id) return fail("NOT_FOUND", 404);
  await store.put("keys", { ...key, status: "revoked" }, { owner: user.id });
  return ok({ revoked: true });
}

export const dynamic = "force-dynamic";
