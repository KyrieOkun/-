import type { Metadata } from "next";
import { getI18n } from "@/lib/i18n/server";
import { privacyPolicy } from "@/data/legal";
import { LegalDocument } from "@/components/legal/legal-doc";
import { pick } from "@/lib/i18n/types";

export async function generateMetadata(): Promise<Metadata> {
  const { locale } = await getI18n();
  return { title: pick(privacyPolicy.title, locale), alternates: { canonical: "/legal/privacy" } };
}

export default async function PrivacyPage() {
  const { locale } = await getI18n();
  return <LegalDocument doc={privacyPolicy} locale={locale} />;
}
