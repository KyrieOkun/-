import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { getI18n } from "@/lib/i18n/server";
import { pick } from "@/lib/i18n/types";
import { vehicles, getVehicle } from "@/data/vehicles";
import { connectFeatures, connectStats } from "@/data/connect";
import { networkStats } from "@/data/charging";
import { atelierPrograms } from "@/data/site";
import { articles } from "@/data/news";
import { HeroOverlay } from "@/components/layout/header-theme";
import { ShowcaseSection } from "@/components/vehicles/showcase-section";
import { VehicleCard } from "@/components/vehicles/vehicle-card";
import { Button } from "@/components/ui/button";
import { Container, Eyebrow, SectionHeading, Badge } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/reveal";
import { Icon } from "@/components/ui/icon";
import { formatCNY, formatDate } from "@/lib/utils";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default async function HomePage() {
  const { locale, t } = await getI18n();
  const showcase = ["xiaomi-su7", "tesla-model-y", "xiaomi-yu7", "tesla-model-3", "xiaomi-su7-ultra", "xiaomi-n90"]
    .map((slug) => getVehicle(slug))
    .filter((v): v is NonNullable<typeof v> => Boolean(v));
  const gridVehicles = vehicles.filter((v) => !showcase.some((s) => s.slug === v.slug));
  const latest = articles.slice(0, 3);

  return (
    <div className="snap-page">
      <HeroOverlay />

      {/* Hero */}
      <section className="snap-section relative flex min-h-[100svh] flex-col overflow-hidden bg-carbon text-white">
        <div className="absolute inset-0 grid grid-rows-2 md:grid-cols-2 md:grid-rows-1">
          <Link href="/vehicles?brand=xiaomi" className="group relative overflow-hidden focus-visible:outline-none" aria-label={`${t.nav.xiaomi} · ${t.nav.allVehicles}`}>
            <Image src="/images/home/xiaomi.jpg" alt={locale === "zh" ? "新一代小米 SU7 官方图" : "New-generation Xiaomi SU7, official imagery"} fill priority sizes="(min-width: 768px) 50vw, 100vw" className="object-cover object-[70%_center] transition-transform duration-[1200ms] ease-brand group-hover:scale-[1.03]" />
            <span className="absolute bottom-6 left-5 hidden items-center gap-2 rounded-pill bg-black/35 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/85 backdrop-blur-md transition-colors group-hover:bg-black/50 group-hover:text-white md:flex lg:bottom-8 lg:left-8">
              <span className="size-1.5 rounded-full bg-mi" />{t.nav.xiaomi}
              <ArrowRight className="size-3.5 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
            </span>
          </Link>
          <Link href="/vehicles?brand=tesla" className="group relative overflow-hidden focus-visible:outline-none" aria-label={`${t.nav.tesla} · ${t.nav.allVehicles}`}>
            <Image src="/images/home/tesla.jpg" alt={locale === "zh" ? "特斯拉 Model Y 官方图" : "Tesla Model Y, official imagery"} fill priority sizes="(min-width: 768px) 50vw, 100vw" className="object-cover object-[35%_center] transition-transform duration-[1200ms] ease-brand group-hover:scale-[1.03]" />
            <span className="absolute bottom-6 right-5 hidden items-center gap-2 rounded-pill bg-black/35 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/85 backdrop-blur-md transition-colors group-hover:bg-black/50 group-hover:text-white md:flex lg:bottom-8 lg:right-8">
              <span className="size-1.5 rounded-full bg-tesla" />{t.nav.tesla}
              <ArrowRight className="size-3.5 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
            </span>
          </Link>
          <div className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-px -translate-x-1/2 bg-white/30 md:block" />
        </div>
        <div className="scrim-t-strong pointer-events-none absolute inset-x-0 top-0 h-[55%]" />
        <div className="scrim-b pointer-events-none absolute inset-x-0 bottom-0 h-3/5" />
        <div className="pointer-events-none relative flex flex-1 flex-col items-center justify-between px-5 pb-16 pt-24 text-center sm:pb-20 sm:pt-28">
          <div className="animate-fade-up flex flex-col items-center">
            <p className="mb-5 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-white/70">
              <span className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-mi" />{t.nav.xiaomi}</span>
              <span className="text-white/40">×</span>
              <span className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-tesla" />{t.nav.tesla}</span>
            </p>
            <h1 className="max-w-4xl text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">{t.home.heroTitle}</h1>
            <p className="mt-5 max-w-2xl text-pretty text-base text-white/80 sm:text-xl">{t.home.heroSubtitle}</p>
          </div>
          <div className="animate-fade-up pointer-events-auto flex w-full flex-col items-center [animation-delay:200ms]">
            <div className="flex w-full max-w-md flex-col gap-3 sm:w-auto sm:max-w-none sm:flex-row">
              <Button href="/vehicles" variant="light" size="lg" className="w-full sm:w-64">{t.home.heroCtaPrimary}</Button>
              <Button href="/test-drive" variant="glass" size="lg" className="w-full sm:w-64">{t.home.heroCtaSecondary}</Button>
            </div>
            <a href="#featured" className="mt-8 hidden flex-col items-center gap-1 text-[11px] uppercase tracking-[0.2em] text-white/60 transition-colors hover:text-white sm:flex">
              {t.home.scroll}
              <ChevronDown className="size-4 animate-bounce" />
            </a>
          </div>
        </div>
      </section>

      <div id="featured" />
      {showcase.map((v) => (
        <ShowcaseSection key={v.slug} vehicle={v} locale={locale} priority={false} />
      ))}

      {/* Remaining line-up */}
      <section className="bg-white py-20 lg:py-28">
        <Container>
          <SectionHeading
            eyebrow={t.nav.allVehicles}
            title={t.home.featuredTitle}
            subtitle={t.home.featuredSubtitle}
            action={<Button href="/vehicles" variant="outline" iconRight={<ArrowRight className="size-4" />}>{t.nav.viewAll}</Button>}
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {gridVehicles.map((v, i) => (
              <Reveal key={v.slug} delay={i * 60}>
                <VehicleCard vehicle={v} locale={locale} compact />
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Connect */}
      <section className="relative overflow-hidden bg-carbon py-20 text-white lg:py-28">
        <div className="pointer-events-none absolute inset-0 opacity-40" style={{ backgroundImage: "radial-gradient(60% 50% at 20% 10%, rgba(255,105,0,0.25), transparent 60%), radial-gradient(50% 40% at 85% 90%, rgba(232,33,39,0.22), transparent 60%)" }} />
        <Container className="relative">
          <SectionHeading eyebrow={t.connect.title} title={t.home.connectTitle} subtitle={t.home.connectSubtitle} tone="light" action={<Button href="/connect" variant="light" iconRight={<ArrowRight className="size-4" />}>{t.nav.learnMore}</Button>} />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {connectFeatures.slice(0, 6).map((f, i) => (
              <Reveal key={f.id} delay={i * 50}>
                <Link href={f.href} className="group flex h-full flex-col rounded-3xl bg-white/[0.06] p-6 hairline-dark transition-colors hover:bg-white/[0.1]">
                  <div className="flex items-center justify-between">
                    <span className="flex size-11 items-center justify-center rounded-2xl bg-white/10"><Icon name={f.icon} className="size-5" /></span>
                    <Badge tone="light">{f.status === "live" ? t.connect.status : t.connect.beta}</Badge>
                  </div>
                  <h3 className="mt-5 text-lg font-semibold">{pick(f.title, locale)}</h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-white/70">{pick(f.summary, locale)}</p>
                  <span className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-white/90">
                    {t.connect.openFeature}
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
          <dl className="mt-14 grid grid-cols-2 gap-8 border-t border-white/10 pt-10 lg:grid-cols-4">
            {connectStats.map((s) => (
              <div key={s.label.zh}>
                <dt className="text-3xl font-semibold tabular-nums sm:text-4xl">{locale === "en" && s.labelEn ? s.labelEn : s.value}</dt>
                <dd className="mt-1 text-sm text-white/60">{pick(s.label, locale)}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      {/* Charging */}
      <section className="bg-white py-20 lg:py-28">
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <Reveal>
              <Eyebrow className="mb-3">{t.charging.title}</Eyebrow>
              <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl lg:text-[44px] lg:leading-[1.08]">{t.home.chargingTitle}</h2>
              <p className="mt-4 text-pretty text-base leading-7 text-slate sm:text-lg">{t.home.chargingSubtitle}</p>
              <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-6">
                {networkStats.slice(0, 4).map((s) => (
                  <div key={s.id}>
                    <dt className="text-2xl font-semibold tabular-nums sm:text-3xl">{locale === "en" && s.valueEn ? s.valueEn : s.value}</dt>
                    <dd className="mt-1 text-sm text-slate">{pick(s.label, locale)}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button href="/charging">{t.charging.stationsTitle}</Button>
                <Button href="/connect/trip-planner" variant="secondary">{t.connect.trip}</Button>
              </div>
            </Reveal>
            <Reveal delay={100} className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-mist">
              <Image src="/images/charging/hero.jpg" alt={t.charging.subtitle} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
            </Reveal>
          </div>
        </Container>
      </section>

      {/* Atelier */}
      <section className="bg-cloud py-20 lg:py-28">
        <Container>
          <SectionHeading eyebrow={t.nav.atelier} title={t.home.atelierTitle} subtitle={t.home.atelierSubtitle} action={<Button href="/atelier" variant="outline" iconRight={<ArrowRight className="size-4" />}>{t.nav.learnMore}</Button>} />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {atelierPrograms.slice(0, 3).map((p, i) => (
              <Reveal key={p.id} delay={i * 60}>
                <Link href={`/atelier#${p.id}`} className="group block overflow-hidden rounded-3xl bg-white hairline transition-shadow hover:shadow-lift">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image src={p.image} alt={pick(p.title, locale)} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">{pick(p.title, locale)}</h3>
                      <span className="text-sm text-slate">{p.priceFrom === 0 ? (locale === "zh" ? "赠送" : "Complimentary") : `${t.atelier.startingAt} ${formatCNY(p.priceFrom)}`}</span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate">{pick(p.summary, locale)}</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* News */}
      <section className="bg-white py-20 lg:py-28">
        <Container>
          <SectionHeading eyebrow={t.nav.news} title={t.home.newsTitle} action={<Button href="/news" variant="outline" iconRight={<ArrowRight className="size-4" />}>{t.nav.viewAll}</Button>} />
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {latest.map((a, i) => (
              <Reveal key={a.slug} delay={i * 60} as="article">
                <Link href={`/news/${a.slug}`} className="group block">
                  <div className="relative aspect-[16/10] overflow-hidden rounded-3xl bg-mist">
                    <Image src={a.image} alt={pick(a.title, locale)} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-xs text-slate">
                    <Badge tone={a.brand === "xiaomi" ? "mi" : a.brand === "tesla" ? "tesla" : "neutral"}>{t.news.category[a.category]}</Badge>
                    <time dateTime={a.date}>{formatDate(a.date, locale)}</time>
                  </div>
                  <h3 className="mt-2 text-lg font-semibold leading-snug group-hover:underline underline-offset-4">{pick(a.title, locale)}</h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate">{pick(a.excerpt, locale)}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-ink py-24 text-white lg:py-32">
        <Image src="/images/vehicles/xiaomi-yu7/scene.jpg" alt="" fill sizes="100vw" className="object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/30" />
        <Container className="relative text-center">
          <Reveal className="mx-auto flex max-w-3xl flex-col items-center">
            <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-5xl">{t.home.ctaTitle}</h2>
            <p className="mt-4 text-base text-white/75 sm:text-lg">{t.home.ctaSubtitle}</p>
            <div className="mt-8 flex w-full max-w-md flex-col gap-3 sm:w-auto sm:max-w-none sm:flex-row">
              <Button href="/vehicles" variant="light" size="lg" className="w-full sm:w-56">{t.nav.design}</Button>
              <Button href="/compare" variant="glass" size="lg" className="w-full sm:w-56">{t.nav.compare}</Button>
            </div>
          </Reveal>
        </Container>
      </section>
    </div>
  );
}
