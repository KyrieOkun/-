import type { Metadata } from "next";
import { getI18n } from "@/lib/i18n/server";
import { vehicles } from "@/data/vehicles";
import { stores } from "@/data/site";
import { cities } from "@/data/cities";
import { Container, Eyebrow } from "@/components/ui/primitives";
import { ServiceForm } from "@/components/forms/service-form";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.connect.serviceTitle, description: t.connect.serviceSubtitle, alternates: { canonical: "/service" } };
}

export default async function ServicePage() {
  const { t } = await getI18n();
  return (
    <div className="pt-14">
      <section className="border-b border-line bg-cloud">
        <Container className="py-12 lg:py-16">
          <Eyebrow className="mb-3">{t.connect.title}</Eyebrow>
          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">{t.connect.serviceTitle}</h1>
          <p className="mt-4 max-w-2xl text-pretty text-base leading-7 text-graphite sm:text-lg">{t.connect.serviceSubtitle}</p>
        </Container>
      </section>
      <Container className="py-12 pb-24">
        <ServiceForm vehicles={vehicles} stores={stores} cities={cities} />
      </Container>
    </div>
  );
}
