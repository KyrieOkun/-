import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { getI18n } from "@/lib/i18n/server";
import { pick } from "@/lib/i18n/types";
import { getVehicle, vehicles } from "@/data/vehicles";
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
    <div className="pt-14">
      <Suspense fallback={<div className="p-8"><Skeleton className="aspect-[16/10] w-full" /></div>}>
        <Configurator vehicle={vehicle} />
      </Suspense>
    </div>
  );
}
