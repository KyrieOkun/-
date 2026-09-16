import type { Metadata } from "next";
import { getI18n } from "@/lib/i18n/server";
import { vehicles } from "@/data/vehicles";
import { stores } from "@/data/site";
import { cities } from "@/data/cities";
import { Container, Eyebrow } from "@/components/ui/primitives";
import { TestDriveForm } from "@/components/forms/test-drive-form";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.testDrive.title, description: t.testDrive.subtitle, alternates: { canonical: "/test-drive" } };
}

export default async function TestDrivePage({ searchParams }: { searchParams: Promise<{ vehicle?: string }> }) {
  const { t } = await getI18n();
  const { vehicle } = await searchParams;
  return (
    <div className="pt-14">
      <section className="border-b border-line bg-cloud">
        <Container className="py-12 lg:py-16">
          <Eyebrow className="mb-3">{t.nav.xiaomi} × {t.nav.tesla}</Eyebrow>
          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">{t.testDrive.title}</h1>
          <p className="mt-4 max-w-2xl text-pretty text-base leading-7 text-graphite sm:text-lg">{t.testDrive.subtitle}</p>
        </Container>
      </section>
      <Container className="py-12 pb-24">
        <TestDriveForm vehicles={vehicles} stores={stores} cities={cities} initialVehicle={vehicle} />
      </Container>
    </div>
  );
}
