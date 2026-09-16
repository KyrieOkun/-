import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Circle, Clock } from "lucide-react";
import { getI18n } from "@/lib/i18n/server";
import { pick } from "@/lib/i18n/types";
import { getVehicle } from "@/data/vehicles";
import { stores } from "@/data/site";
import { store } from "@/lib/store";
import { getCurrentUser } from "@/lib/auth";
import type { OrderRecord, OrderStatus } from "@/lib/orders";
import { computeQuote } from "@/lib/pricing";
import { Button } from "@/components/ui/button";
import { Container, Eyebrow, Badge } from "@/components/ui/primitives";
import { PaintSwatch } from "@/components/vehicles/swatches";
import { cn, formatCNY, formatDateTime, maskPhone } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.order.successTitle, robots: { index: false } };
}

const FLOW: OrderStatus[] = ["pending", "paid", "production", "delivered"];

export default async function OrderDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ phone?: string }> }) {
  const { id } = await params;
  const { phone } = await searchParams;
  const { t, locale } = await getI18n();
  const order = await store.get<OrderRecord>("orders", id);
  if (!order) notFound();
  const user = await getCurrentUser().catch(() => null);
  const isOwner = user && order.ownerId === user.id;
  if (!isOwner && phone !== order.buyer.phone) notFound();
  const vehicle = getVehicle(order.vehicleSlug);
  if (!vehicle) notFound();
  const quote = computeQuote(vehicle, order.selection);
  const deliveryStore = stores.find((s) => s.id === order.deliveryStoreId);
  const statusLabel: Record<OrderStatus, string> = { pending: t.order.statusPending, paid: t.order.statusPaid, production: t.order.statusProduction, delivered: t.order.statusDelivered };
  const currentIndex = FLOW.indexOf(order.status);

  return (
    <div className="pt-14">
      <section className="border-b border-line bg-cloud">
        <Container className="py-12 lg:py-16">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="size-8 text-success" />
            <Eyebrow>{t.order.successTitle}</Eyebrow>
          </div>
          <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">{pick(vehicle.name, locale)} · {pick(quote.trim.name, locale)}</h1>
          <p className="mt-3 max-w-2xl text-pretty text-base leading-7 text-graphite">{t.order.successBody}</p>
          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
            <span className="text-slate">{t.order.orderNo}</span>
            <span className="rounded-pill bg-white px-3 py-1 font-mono font-semibold hairline">{order.id}</span>
            <Badge tone="success">{statusLabel[order.status]}</Badge>
          </div>
        </Container>
      </section>

      <Container className="grid gap-8 py-12 pb-24 lg:grid-cols-[1fr_400px]">
        <div className="space-y-6">
          <section className="rounded-3xl bg-white p-6 hairline">
            <h2 className="text-lg font-semibold">{t.order.timeline}</h2>
            <ol className="mt-6 grid gap-4 sm:grid-cols-4">
              {FLOW.map((s, i) => {
                const done = i <= currentIndex;
                const at = order.timeline.find((x) => x.status === s)?.at;
                return (
                  <li key={s} className="relative">
                    <div className="flex items-center gap-2">
                      {done ? <CheckCircle2 className="size-5 text-success" /> : <Circle className="size-5 text-line" />}
                      <span className={cn("text-sm font-medium", !done && "text-ash")}>{statusLabel[s]}</span>
                    </div>
                    <p className="mt-1 pl-7 text-xs text-ash">{at ? formatDateTime(at, locale) : i === currentIndex + 1 ? (locale === "zh" ? `预计 ${quote.deliveryWeeks[0]}-${quote.deliveryWeeks[1]} 周` : `Est. ${quote.deliveryWeeks[0]}-${quote.deliveryWeeks[1]} weeks`) : "—"}</p>
                  </li>
                );
              })}
            </ol>
          </section>

          <section className="rounded-3xl bg-white p-6 hairline">
            <h2 className="text-lg font-semibold">{t.order.config}</h2>
            <dl className="mt-4 divide-y divide-line text-sm">
              <Row label={t.configurator.trim} value={pick(quote.trim.name, locale)} />
              <Row label={t.configurator.color} value={<span className="flex items-center gap-2"><PaintSwatch paint={quote.paint} size={14} />{pick(quote.paint.name, locale)}</span>} />
              <Row label={t.configurator.wheel} value={pick(quote.wheel.name, locale)} />
              <Row label={t.configurator.interior} value={pick(quote.interior.name, locale)} />
              {quote.extras.map((e) => (
                <Row key={e.id} label={t.configurator.extras} value={pick(e.name, locale)} />
              ))}
              <Row label={t.configurator.vehiclePrice} value={formatCNY(quote.subtotal)} />
              <Row label={t.configurator.purchaseTax} value={formatCNY(quote.purchaseTax)} />
              <Row label={t.configurator.totalPrice} value={<span className="font-semibold">{formatCNY(quote.total)}</span>} />
              <Row label={t.order.financing} value={t.order[order.financing]} />
            </dl>
          </section>

          <section className="rounded-3xl bg-white p-6 hairline">
            <h2 className="text-lg font-semibold">{t.order.buyer} · {t.order.deliveryCenter}</h2>
            <dl className="mt-4 divide-y divide-line text-sm">
              <Row label={t.forms.name} value={order.buyer.name} />
              <Row label={t.forms.phone} value={maskPhone(order.buyer.phone)} />
              <Row label={locale === "zh" ? "上牌城市" : "Registration city"} value={order.buyer.city} />
              <Row label={t.order.deliveryCenter} value={deliveryStore ? `${pick(deliveryStore.name, locale)} · ${pick(deliveryStore.address, locale)}` : order.deliveryStoreId} />
              <Row label={t.order.payment} value={`${t.order[order.payment]} · ${formatCNY(order.quote.deposit)} · ${order.paidAt ? formatDateTime(order.paidAt, locale) : ""}`} />
            </dl>
          </section>
        </div>

        <aside className="h-fit space-y-4 lg:sticky lg:top-24">
          <div className="overflow-hidden rounded-3xl bg-white hairline">
            <div className="relative aspect-[16/9] bg-mist">
              <Image src={quote.paint.image ?? vehicle.hero.src} alt={`${pick(vehicle.name, locale)} · ${pick(quote.paint.name, locale)}`} fill sizes="400px" className="object-cover" />
            </div>
            <div className="p-6">
              <p className="text-sm text-slate">{t.common.deposit}</p>
              <p className="text-3xl font-semibold tabular-nums">{formatCNY(order.quote.deposit)}</p>
              <p className="mt-2 flex items-center gap-1 text-xs text-ash"><Clock className="size-3.5" />{t.configurator.deliveryEta} {quote.deliveryWeeks[0]}-{quote.deliveryWeeks[1]} {t.common.weeks}</p>
              <div className="mt-5 grid gap-2">
                <Button href="/connect/garage">{t.connect.garage}</Button>
                <Button href="/charging" variant="secondary">{t.charging.homeTitle}</Button>
                <Link href="/support" className="text-center text-sm text-graphite underline-offset-4 hover:underline">{t.nav.support}</Link>
              </div>
            </div>
          </div>
          <p className="text-xs leading-5 text-ash">{t.order.refundNote}</p>
        </aside>
      </Container>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-4 py-3">
      <dt className="text-slate">{label}</dt>
      <dd className="text-ink">{value}</dd>
    </div>
  );
}
