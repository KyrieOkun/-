import { getCurrentUser, toPublicUser } from "@/lib/auth";
import { ok } from "@/lib/api";

export async function GET() {
  const user = await getCurrentUser();
  return ok({ user: user ? toPublicUser(user) : null });
}

export const dynamic = "force-dynamic";
