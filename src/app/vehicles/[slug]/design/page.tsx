import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { getI18n } from "@/lib/i18n/server";
import { pick } from "@/lib/i18n/types";
import { getVehicle, vehicles } from "@/data/vehicles";
import { toClientVehicle } from "@/data/types";
import { Configurator } from "@/components/vehicles/configurator";
import { Skeleton } from "@/components/ui/primitives";

interface Params {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return vehicles.filter((v) => v.availability !== "overseas").map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const vehicle = getVehicle(slug);
  const { locale, t } = await getI18n();
  if (!vehicle) return {};
  return {
    title: `${t.configurator.title} · ${pick(vehicle.name, locale)}`,
    description: pick(vehicle.description, locale),
    robots: { index: false, follow: true },
  };
}

export default async function DesignPage({ params }: Params) {
  const { slug } = await params;
  const vehicle = getVehicle(slug);
  if (!vehicle) notFound();
  if (vehicle.availability === "overseas") redirect(`/vehicles/${vehicle.slug}#interest`);

  return (
    // Bottom padding reserves room for the fixed mobile price bar so the last
    // step, the saved builds and the footer are never hidden behind it.
    <div className="pt-14 pb-[calc(5.5rem+env(safe-area-inset-bottom))] lg:pb-0">
      <Suspense fallback={<div className="p-8"><Skeleton className="aspect-[16/10] w-full" /></div>}>
        <Configurator vehicle={toClientVehicle(vehicle)} />
      </Suspense>
    </div>
  );
}
