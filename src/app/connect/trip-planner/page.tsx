import type { Metadata } from "next";
import { getI18n } from "@/lib/i18n/server";
import { cities } from "@/data/cities";
import { vehicles } from "@/data/vehicles";
import { Container, Eyebrow } from "@/components/ui/primitives";
import { TripPlanner } from "@/components/connect/trip-planner";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.connect.tripTitle, description: t.connect.tripSubtitle, alternates: { canonical: "/connect/trip-planner" } };
}

export default async function TripPlannerPage({ searchParams }: { searchParams: Promise<{ vehicle?: string }> }) {
  const { t } = await getI18n();
  const { vehicle } = await searchParams;
  return (
    <div className="pt-14">
      <section className="border-b border-line bg-cloud">
        <Container className="py-12 lg:py-16">
          <Eyebrow className="mb-3">{t.connect.title}</Eyebrow>
          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">{t.connect.tripTitle}</h1>
          <p className="mt-4 max-w-2xl text-pretty text-base leading-7 text-slate sm:text-lg">{t.connect.tripSubtitle}</p>
        </Container>
      </section>
      <Container className="py-12 pb-24">
        <TripPlanner cities={cities} vehicles={vehicles.filter((v) => v.availability !== "overseas")} initialVehicle={vehicle} />
      </Container>
    </div>
  );
}
