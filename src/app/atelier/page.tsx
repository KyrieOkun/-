import type { Metadata } from "next";
import Image from "next/image";
import { Check } from "lucide-react";
import { getI18n } from "@/lib/i18n/server";
import { pick } from "@/lib/i18n/types";
import { atelierPrograms, atelierSteps } from "@/data/site";
import { vehicles } from "@/data/vehicles";
import { toClientVehicle } from "@/data/types";
import { HeroOverlay } from "@/components/layout/header-theme";
import { Button } from "@/components/ui/button";
import { Badge, Container, SectionHeading } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/reveal";
import { ConsultationForm } from "@/components/forms/consultation-form";
import { formatCNY } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.atelier.title, description: t.atelier.subtitle, alternates: { canonical: "/atelier" } };
}

export default async function AtelierPage() {
  const { t, locale } = await getI18n();
  const zh = locale === "zh";
  return (
    <div>
      <HeroOverlay />
      <section className="relative flex min-h-[90svh] flex-col overflow-hidden bg-carbon text-white">
        <Image src="/images/atelier/hero.jpg" alt={t.atelier.subtitle} fill priority sizes="100vw" className="object-cover" />
        <div className="scrim-t pointer-events-none absolute inset-x-0 top-0 h-1/2" />
        <div className="scrim-b pointer-events-none absolute inset-x-0 bottom-0 h-2/3" />
        <Container className="relative flex flex-1 flex-col justify-end pb-16 pt-32">
          <div className="animate-fade-up max-w-3xl">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.32em] text-atelier-soft">{t.brand.short}</p>
            <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-6xl">{t.atelier.title}</h1>
            <p className="mt-5 max-w-2xl text-pretty text-lg text-white/80">{t.atelier.subtitle}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href="#consult" variant="light" size="lg" className="sm:w-56">{t.atelier.bookConsult}</Button>
              <Button href="#programs" variant="glass" size="lg" className="sm:w-56">{t.atelier.programs}</Button>
            </div>
          </div>
        </Container>
      </section>

      <section id="programs" className="scroll-mt-20 py-20 lg:py-28">
        <Container>
          <SectionHeading eyebrow={t.atelier.programs} title={zh ? "四大定制项目" : "Four programs"} subtitle={zh ? "全部由两大品牌官方认证工坊按原厂标准施工，原厂质保不受影响，定制部件另享 3 年质保。" : "Executed by workshops certified by both brands to factory standards; factory warranty preserved, plus 3 years on bespoke parts."} />
          <div className="mt-12 space-y-8">
            {atelierPrograms.map((p, i) => (
              <Reveal key={p.id} as="article">
                <div id={p.id} className={`grid scroll-mt-24 items-center gap-8 overflow-hidden rounded-3xl bg-white hairline lg:grid-cols-2 ${i % 2 ? "lg:[&>*:first-child]:order-2" : ""}`}>
                  <div className="relative aspect-[4/3] bg-mist lg:aspect-auto lg:h-full lg:min-h-[380px]">
                    <Image src={p.image} alt={pick(p.title, locale)} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
                  </div>
                  <div className="p-8 lg:p-12">
                    <div className="flex flex-wrap gap-2">
                      {p.brands.map((b) => (
                        <Badge key={b} tone={b === "xiaomi" ? "mi" : "tesla"}>{b === "xiaomi" ? t.nav.xiaomi : t.nav.tesla}</Badge>
                      ))}
                    </div>
                    <h3 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">{pick(p.title, locale)}</h3>
                    <p className="mt-3 text-pretty text-base leading-7 text-slate">{pick(p.summary, locale)}</p>
                    <ul className="mt-5 space-y-2 text-sm text-graphite">
                      {p.includes.map((s) => (
                        <li key={s.zh} className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-success" />{pick(s, locale)}</li>
                      ))}
                    </ul>
                    <dl className="mt-6 flex gap-8 border-t border-line pt-5 text-sm">
                      <div>
                        <dt className="text-ash">{t.atelier.startingAt}</dt>
                        <dd className="mt-0.5 text-lg font-semibold tabular-nums">{p.priceFrom === 0 ? (zh ? "赠送" : "Complimentary") : formatCNY(p.priceFrom)}</dd>
                      </div>
                      <div>
                        <dt className="text-ash">{t.atelier.leadTime}</dt>
                        <dd className="mt-0.5 text-lg font-semibold tabular-nums">{p.leadWeeks[0] === 0 ? (zh ? "交付时" : "At delivery") : `+${p.leadWeeks[0]}-${p.leadWeeks[1]} ${t.common.weeks}`}</dd>
                      </div>
                    </dl>
                    <Button href="#consult" className="mt-6">{t.atelier.bookConsult}</Button>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-cloud py-20 lg:py-28">
        <Container>
          <SectionHeading eyebrow={t.atelier.process} title={zh ? "从想法到交付" : "From idea to delivery"} />
          <ol className="mt-12 grid gap-5 md:grid-cols-5">
            {atelierSteps.map((s, i) => (
              <Reveal key={s.step} delay={i * 50} as="li">
                <div className="h-full rounded-3xl bg-white p-6 hairline">
                  <span className="text-xs font-semibold tabular-nums text-atelier-deep">{s.step}</span>
                  <h3 className="mt-3 text-base font-semibold">{pick(s.title, locale)}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate">{pick(s.body, locale)}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </Container>
      </section>

      <section id="consult" className="scroll-mt-20 py-20 lg:py-28">
        <Container className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <SectionHeading eyebrow={t.atelier.bookConsult} title={zh ? "预约您的定制顾问" : "Meet your bespoke advisor"} subtitle={zh ? "24 小时内回电，旗舰店定制体验区可实物比对色卡、皮革与碳纤维样件。" : "We call back within 24 hours; compare real colour cards, leathers and carbon samples in our flagship studios."} />
            <div className="relative mt-8 aspect-[4/3] overflow-hidden rounded-3xl bg-mist">
              <Image src="/images/atelier/paint.jpg" alt={t.atelier.title} fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
            </div>
          </div>
          <ConsultationForm vehicles={vehicles.filter((v) => v.availability !== "overseas").map(toClientVehicle)} programs={atelierPrograms} />
        </Container>
      </section>
    </div>
  );
}
