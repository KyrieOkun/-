import type { Metadata } from "next";
import Image from "next/image";
import { Check } from "lucide-react";
import { getI18n } from "@/lib/i18n/server";
import { pick } from "@/lib/i18n/types";
import { chargingBenefits, homeChargers, networkStats, toMapStation } from "@/data/charging";
import { cities } from "@/data/cities";
import { HeroOverlay } from "@/components/layout/header-theme";
import { Button } from "@/components/ui/button";
import { Badge, Container, SectionHeading } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/icon";
import { Reveal } from "@/components/ui/reveal";
import { StationFinder } from "@/components/charging/station-finder";
import { NetworkMap } from "@/components/charging/network-map";
import { stations } from "@/data/charging";
import { formatCNY } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.charging.title, description: t.charging.subtitle, alternates: { canonical: "/charging" } };
}

export default async function ChargingPage() {
  const { t, locale } = await getI18n();
  const zh = locale === "zh";
  return (
    <div>
      <HeroOverlay />
      <section className="relative flex min-h-[78svh] flex-col overflow-hidden bg-carbon text-white">
        <Image src="/images/charging/hero.jpg" alt={t.charging.subtitle} fill priority sizes="100vw" className="object-cover" />
        <div className="scrim-t pointer-events-none absolute inset-x-0 top-0 h-1/2" />
        <div className="scrim-b pointer-events-none absolute inset-x-0 bottom-0 h-2/3" />
        <Container className="relative flex flex-1 flex-col justify-end pb-16 pt-32">
          <div className="animate-fade-up max-w-3xl">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.32em] text-white/70">{t.charging.title}</p>
            <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-6xl">{t.home.chargingTitle}</h1>
            <p className="mt-5 max-w-2xl text-pretty text-lg text-white/80">{t.charging.subtitle}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href="#stations" variant="light" size="lg" className="sm:w-56">{t.charging.stationsTitle}</Button>
              <Button href="/connect/trip-planner" variant="glass" size="lg" className="sm:w-56">{t.connect.trip}</Button>
            </div>
          </div>
        </Container>
      </section>
      {/* Network figures on a solid band so they stay legible on every photo crop. */}
      <section className="bg-carbon text-white">
        <Container>
          <dl className="grid grid-cols-2 gap-6 border-t border-white/10 py-10 md:grid-cols-3 lg:grid-cols-6">
            {networkStats.map((s) => (
              <div key={s.id}>
                <dt className="text-2xl font-semibold tabular-nums sm:text-3xl">{locale === "en" && s.valueEn ? s.valueEn : s.value}</dt>
                <dd className="mt-1 text-xs text-white/60">{pick(s.label, locale)}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      <section className="py-16 lg:py-24">
        <Container>
          <SectionHeading eyebrow={t.connect.charging} title={zh ? "跨品牌充电互通，已经发生" : "Cross-brand charging, live today"} subtitle={zh ? "截至 2026 年 4 月，特斯拉在中国内地向非特斯拉车辆开放 1,000+ 座超级充电站，价格与特斯拉车主一致；小米充电地图接入 170 万+ 充电桩并对所有品牌开放。联名账户把两张网变成一张。" : "As of April 2026, 1,000+ Tesla Superchargers in mainland China are open to non-Tesla EVs at the same price as Tesla owners, and the Xiaomi charging map's 1.7M+ stalls are open to every brand. One linked account turns two networks into one."} />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {chargingBenefits.map((b, i) => (
              <Reveal key={b.title.zh} delay={i * 50}>
                <div className="h-full rounded-3xl bg-cloud p-6 hairline">
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-white hairline"><Icon name={b.icon} className="size-5" /></span>
                  <h3 className="mt-5 text-lg font-semibold">{pick(b.title, locale)}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate">{pick(b.body, locale)}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section id="stations" className="scroll-mt-20 bg-cloud py-16 lg:py-24">
        <Container>
          <SectionHeading eyebrow={t.charging.liveStatus} title={t.charging.stationsTitle} subtitle={zh ? "小米超充、特斯拉超充与合作运营商站点实时空闲情况，每分钟刷新。点击导航跳转高德地图。" : "Live availability across Xiaomi, Tesla and partner stations, refreshed every minute. Navigate opens Amap."} />
          <div className="mt-10">
            <NetworkMap stations={stations.map(toMapStation)} />
          </div>
          <div className="mt-8">
            <StationFinder cities={cities} />
          </div>
          <p className="mt-6 text-xs text-ash">{t.charging.priceNote}</p>
        </Container>
      </section>

      <section className="py-16 lg:py-24">
        <Container className="grid items-start gap-12 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <SectionHeading eyebrow={t.charging.homeTitle} title={t.charging.homeTitle} subtitle={t.charging.homeSubtitle} />
            <div className="relative mt-8 aspect-[4/3] overflow-hidden rounded-3xl bg-mist">
              <Image src="/images/charging/home.jpg" alt={t.charging.homeTitle} fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {homeChargers.map((c) => (
              <div key={c.id} className="flex flex-col rounded-3xl bg-white p-6 hairline">
                <Badge tone={c.brand === "xiaomi" ? "mi" : "tesla"} className="w-fit">{c.brand === "xiaomi" ? t.nav.xiaomi : t.nav.tesla}</Badge>
                <h3 className="mt-4 text-lg font-semibold">{pick(c.name, locale)}</h3>
                <p className="mt-1 text-2xl font-semibold tabular-nums">{formatCNY(c.price)}</p>
                <p className="mt-1 text-xs text-slate">{pick(c.note, locale)}</p>
                <ul className="mt-4 flex-1 space-y-1.5 text-sm text-graphite">
                  {c.bullets.map((b) => (
                    <li key={b.zh} className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-success" />{pick(b, locale)}</li>
                  ))}
                </ul>
                <Button href="/service" variant="secondary" size="sm" className="mt-5">{zh ? "预约安装" : "Book installation"}</Button>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-cloud py-16 lg:py-24">
        <Container>
          <SectionHeading eyebrow={t.charging.pricingTitle} title={zh ? "费用怎么算" : "How pricing works"} />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {(zh
              ? [
                  { title: "电费 + 服务费", body: "各站点按度计价，含电费与服务费；高速服务区与城市核心区略高，谷电时段更优惠。" },
                  { title: "会员权益", body: "联名账户享分时电价、停车费减免；小米积分可 1:1 抵扣服务费（每单最高 50%）。" },
                  { title: "超时占用费", body: "充电完成后 5 分钟宽限期，之后按 ¥3.2/分钟收取占用费，站点满负荷时生效，与特斯拉官方政策一致。" },
                ]
              : [
                  { title: "Energy + service fee", body: "Per-kWh pricing including energy and service fee; higher at highway and downtown sites, cheaper off-peak." },
                  { title: "Member benefits", body: "Linked accounts get time-of-use rates and parking waivers; Xiaomi points offset service fees 1:1 (up to 50% per session)." },
                  { title: "Idle fees", body: "5-minute grace after charging completes, then ¥3.2/min while the station is busy — aligned with Tesla's policy." },
                ]
            ).map((c) => (
              <div key={c.title} className="rounded-3xl bg-white p-6 hairline">
                <h3 className="text-lg font-semibold">{c.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate">{c.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </div>
  );
}
