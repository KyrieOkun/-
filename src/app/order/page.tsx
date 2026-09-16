import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getI18n } from "@/lib/i18n/server";
import { pick } from "@/lib/i18n/types";
import { getVehicle, vehicles } from "@/data/vehicles";
import { stores } from "@/data/site";
import { majorCities } from "@/data/cities";
import { decodeSelection, normalizeSelection } from "@/lib/pricing";
import { Container, Eyebrow, SectionHeading } from "@/components/ui/primitives";
import { OrderCheckout } from "@/components/forms/order-checkout";
import { OrderLookup } from "@/components/forms/order-lookup";
import { VehicleCard } from "@/components/vehicles/vehicle-card";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.order.title, description: t.order.subtitle, robots: { index: false } };
}

export default async function OrderPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { t, locale } = await getI18n();
  const params = await searchParams;
  const slug = Array.isArray(params.vehicle) ? params.vehicle[0] : params.vehicle;
  const vehicle = slug ? getVehicle(slug) : undefined;

  if (vehicle && vehicle.availability !== "overseas") {
    const selection = normalizeSelection(vehicle, decodeSelection(params));
    return (
      <div className="pt-14">
        <section className="border-b border-line bg-cloud">
          <Container className="py-10 lg:py-14">
            <Eyebrow className="mb-3">{pick(vehicle.name, locale)}</Eyebrow>
            <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">{t.order.title}</h1>
            <p className="mt-3 max-w-2xl text-pretty text-base leading-7 text-slate">{t.order.subtitle}</p>
          </Container>
        </section>
        <Container className="py-10 pb-24">
          <OrderCheckout vehicle={vehicle} selection={selection} stores={stores} cities={majorCities} />
        </Container>
      </div>
    );
  }

  return (
    <div className="pt-14">
      <section className="border-b border-line bg-cloud">
        <Container className="py-12 lg:py-16">
          <Eyebrow className="mb-3">{t.nav.xiaomi} × {t.nav.tesla}</Eyebrow>
          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">{t.nav.order}</h1>
          <p className="mt-4 max-w-2xl text-pretty text-base leading-7 text-slate sm:text-lg">{locale === "zh" ? "选择车型开始在线选配，支付定金即锁定配置与排产。" : "Pick a vehicle to configure online; pay the deposit to lock your build and production slot."}</p>
        </Container>
      </section>
      <Container className="py-12">
        <h2 className="mb-6 text-xl font-semibold tracking-tight">{locale === "zh" ? "选择车型" : "Choose a vehicle"}</h2>
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {vehicles.filter((v) => v.availability !== "overseas").map((v) => (
            <VehicleCard key={v.slug} vehicle={v} locale={locale} compact />
          ))}
        </div>
      </Container>
      <Container className="pb-24">
        <SectionHeading eyebrow={t.order.lookup} title={t.order.lookup} subtitle={locale === "zh" ? "输入订单编号与下单手机号查看订单进度。" : "Enter your order number and mobile to view progress."} />
        <div className="mt-8 max-w-xl">
          <OrderLookup />
        </div>
        <Link href="/account" className="mt-6 inline-flex items-center gap-1 text-sm font-medium underline-offset-4 hover:underline">
          {t.account.orders}
          <ArrowRight className="size-4" />
        </Link>
      </Container>
    </div>
  );
}
