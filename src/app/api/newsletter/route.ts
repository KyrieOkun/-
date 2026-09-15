import { z } from "zod";
import { created, parseBody, rateLimit } from "@/lib/api";
import { store } from "@/lib/store";
import { generateId } from "@/lib/utils";

const schema = z.object({ email: z.string().email().max(120) });

export async function POST(request: Request) {
  const limited = rateLimit(request, "newsletter", 10);
  if (limited) return limited;
  const parsed = await parseBody(request, schema);
  if ("error" in parsed) return parsed.error;
  const email = parsed.data.email.toLowerCase();
  const existing = await store.getByLookup<{ id: string }>("newsletter", "email", email);
  if (!existing) {
    const doc = { id: generateId("NL"), email, createdAt: new Date().toISOString() };
    await store.put("newsletter", doc);
    await store.setLookup("newsletter", "email", email, doc.id);
  }
  return created({ subscribed: true });
}

export const dynamic = "force-dynamic";
