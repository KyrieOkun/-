import type { Metadata } from "next";
import { getI18n } from "@/lib/i18n/server";
import { vehicles } from "@/data/vehicles";
import { Container, Eyebrow } from "@/components/ui/primitives";
import { TradeInForm } from "@/components/forms/trade-in-form";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.tradeIn.title, description: t.tradeIn.subtitle, alternates: { canonical: "/trade-in" } };
}

export default async function TradeInPage() {
  const { t } = await getI18n();
  return (
    <div className="pt-14">
      <section className="border-b border-line bg-cloud">
        <Container className="py-12 lg:py-16">
          <Eyebrow className="mb-3">{t.connect.title}</Eyebrow>
          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">{t.tradeIn.title}</h1>
          <p className="mt-4 max-w-2xl text-pretty text-base leading-7 text-slate sm:text-lg">{t.tradeIn.subtitle}</p>
        </Container>
      </section>
      <Container className="py-12 pb-24">
        <TradeInForm vehicles={vehicles} />
      </Container>
    </div>
  );
}
