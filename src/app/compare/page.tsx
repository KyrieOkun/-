import type { Metadata } from "next";
import { Suspense } from "react";
import { getI18n } from "@/lib/i18n/server";
import { vehicles } from "@/data/vehicles";
import { toClientVehicle } from "@/data/types";
import { Container, Eyebrow, Skeleton } from "@/components/ui/primitives";
import { CompareTable } from "@/components/vehicles/compare-table";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.compare.title, description: t.compare.subtitle, alternates: { canonical: "/compare" } };
}

export default async function ComparePage() {
  const { t } = await getI18n();
  return (
    <div className="pt-14">
      <section className="border-b border-line bg-cloud">
        <Container className="py-14 lg:py-20">
          <Eyebrow className="mb-3">{t.nav.xiaomi} × {t.nav.tesla}</Eyebrow>
          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">{t.compare.title}</h1>
          <p className="mt-4 max-w-2xl text-pretty text-base leading-7 text-slate sm:text-lg">{t.compare.subtitle}</p>
        </Container>
      </section>
      <Container className="py-12 pb-24">
        <Suspense fallback={<Skeleton className="h-96 w-full" />}>
          <CompareTable vehicles={vehicles.map(toClientVehicle)} />
        </Suspense>
        <p className="mt-10 text-xs leading-5 text-ash">{t.common.officialNote}</p>
      </Container>
    </div>
  );
}
