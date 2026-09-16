import { z } from "zod";
import { LOCALES, LOCALE_COOKIE } from "@/lib/i18n/types";
import { fail, ok, parseBody } from "@/lib/api";

const schema = z.object({ locale: z.enum(LOCALES) });

export async function POST(request: Request) {
  const parsed = await parseBody(request, schema);
  if ("error" in parsed) return parsed.error;
  const res = ok({ locale: parsed.data.locale });
  res.cookies.set(LOCALE_COOKIE, parsed.data.locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production" && process.env.ALLOW_INSECURE_HTTP !== "true",
  });
  return res;
}

export async function GET() {
  return fail("Method not allowed", 405);
}

export const dynamic = "force-dynamic";
