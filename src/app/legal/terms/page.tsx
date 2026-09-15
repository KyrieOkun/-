import type { Metadata } from "next";
import { getI18n } from "@/lib/i18n/server";
import { termsOfService } from "@/data/legal";
import { LegalDocument } from "@/components/legal/legal-doc";
import { pick } from "@/lib/i18n/types";

export async function generateMetadata(): Promise<Metadata> {
  const { locale } = await getI18n();
  return { title: pick(termsOfService.title, locale), alternates: { canonical: "/legal/terms" } };
}

export default async function TermsPage() {
  const { locale } = await getI18n();
  return <LegalDocument doc={termsOfService} locale={locale} />;
}
