import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { getI18n } from "@/lib/i18n/server";
import { pick } from "@/lib/i18n/types";
import { connectFeatures, connectStats } from "@/data/connect";
import { HeroOverlay } from "@/components/layout/header-theme";
import { Button } from "@/components/ui/button";
import { Badge, Container, SectionHeading } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/reveal";
import { Icon } from "@/components/ui/icon";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.connect.title, description: t.connect.subtitle, alternates: { canonical: "/connect" } };
}

export default async function ConnectPage() {
  const { locale, t } = await getI18n();
  const steps = locale === "zh"
    ? [
        { n: "01", title: "创建统一账户", body: "手机号或邮箱注册，一个账户管理两大品牌。" },
        { n: "02", title: "绑定小米账号与 Tesla 账号", body: "OAuth 2.0 一键授权，数据授权随时可撤销。" },
        { n: "03", title: "添加车辆到车库", body: "自动同步在名下车辆；也可手动录入车架号。" },
        { n: "04", title: "开启联动", body: "充电互通、数字钥匙、生态场景与行程规划即刻可用。" },
      ]
    : [
        { n: "01", title: "Create One ID", body: "Sign up with mobile or email — one account for both brands." },
        { n: "02", title: "Link Xiaomi & Tesla accounts", body: "One-tap OAuth 2.0 authorisation; revoke any time." },
        { n: "03", title: "Add vehicles to your garage", body: "Vehicles sync automatically, or add by VIN." },
        { n: "04", title: "Go live", body: "Charging interop, digital keys, scenes and trip planning are ready instantly." },
      ];

  return (
    <div>
      <HeroOverlay />
      <section className="relative flex min-h-[78svh] flex-col overflow-hidden bg-carbon text-white">
        <Image src="/images/connect/hero.jpg" alt={t.connect.subtitle} fill priority sizes="100vw" className="object-cover opacity-80" />
        <div className="scrim-t pointer-events-none absolute inset-x-0 top-0 h-1/2" />
        <div className="scrim-b pointer-events-none absolute inset-x-0 bottom-0 h-2/3" />
        <Container className="relative flex flex-1 flex-col justify-end pb-16 pt-32">
          <div className="animate-fade-up max-w-3xl">
            <p className="eyebrow mb-4 flex items-center gap-3 text-dusk">
              <span className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-mi" />{t.nav.xiaomi}</span>
              <span className="text-fog">×</span>
              <span className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-tesla" />{t.nav.tesla}</span>
            </p>
            <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-6xl">{t.home.connectTitle}</h1>
            <p className="mt-5 max-w-2xl text-pretty text-lg text-fog">{t.connect.subtitle}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href="/connect/garage" variant="light" size="lg" className="sm:w-56">{t.connect.garage}</Button>
              <Button href="/connect/trip-planner" variant="glass" size="lg" className="sm:w-56">{t.connect.trip}</Button>
            </div>
          </div>
        </Container>
      </section>
      <section className="bg-carbon text-white">
        <Container>
          <dl className="grid grid-cols-2 gap-6 border-t border-white/10 py-10 lg:grid-cols-4">
            {connectStats.map((s) => (
              <div key={s.label.zh}>
                <dt className="text-3xl font-semibold tabular-nums">{locale === "en" && s.labelEn ? s.labelEn : s.value}</dt>
                <dd className="mt-1 text-sm text-dusk">{pick(s.label, locale)}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      <section className="py-20 lg:py-28">
        <Container>
          <SectionHeading eyebrow={t.connect.title} title={locale === "zh" ? "九大联动能力，全部上线" : "Nine integrations, all live"} subtitle={locale === "zh" ? "无灰度、无等待。绑定账户即刻可用。" : "No waitlist. Link your accounts and go."} />
          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {connectFeatures.map((f, i) => (
              <Reveal key={f.id} delay={(i % 3) * 60} className="h-full">
                <article className="flex h-full flex-col rounded-3xl bg-white p-6 hairline transition-shadow hover:shadow-lift">
                  <div className="flex items-center justify-between">
                    <span className="flex size-11 items-center justify-center rounded-2xl bg-mist"><Icon name={f.icon} className="size-5" /></span>
                    <div className="flex gap-2">
                      {f.requiresLogin ? <Badge tone="neutral">{t.nav.login}</Badge> : null}
                      <Badge tone="success">{f.status === "live" ? t.connect.status : t.connect.beta}</Badge>
                    </div>
                  </div>
                  <h2 className="mt-5 text-xl font-semibold">{pick(f.title, locale)}</h2>
                  <p className="mt-2 text-sm leading-6 text-graphite">{pick(f.summary, locale)}</p>
                  <ul className="mt-4 flex-1 space-y-2 text-sm text-graphite">
                    {f.bullets.map((b) => (
                      <li key={b.zh} className="flex gap-2">
                        <Check className="mt-0.5 size-4 shrink-0 text-success" />
                        <span>{pick(b, locale)}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href={f.href} className="mt-6 inline-flex items-center gap-1 text-sm font-semibold underline-offset-4 hover:underline">
                    {t.connect.openFeature}
                    <ArrowRight className="size-4" />
                  </Link>
                </article>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-cloud py-20 lg:py-28">
        <Container>
          <SectionHeading eyebrow={t.account.oneIdTitle} title={locale === "zh" ? "四步完成联动" : "Connected in four steps"} subtitle={t.account.oneIdBody} action={<Button href="/account" iconRight={<ArrowRight className="size-4" />}>{t.nav.register}</Button>} />
          <ol className="mt-12 grid gap-5 md:grid-cols-4">
            {steps.map((s, i) => (
              <Reveal key={s.n} delay={i * 60} as="li">
                <div className="h-full rounded-3xl bg-white p-6 hairline">
                  <span className="text-xs font-semibold tabular-nums text-ash">{s.n}</span>
                  <h3 className="mt-3 text-lg font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-graphite">{s.body}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </Container>
      </section>

      <section className="py-20 lg:py-28">
        <Container className="grid items-center gap-12 lg:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-mist">
            <Image src="/images/connect/keys.jpg" alt={t.connect.keysTitle} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          </div>
          <div>
            <SectionHeading eyebrow={t.connect.keys} title={t.connect.keysTitle} subtitle={t.connect.keysSubtitle} />
            <ul className="mt-6 space-y-3 text-sm text-graphite">
              {(locale === "zh"
                ? ["UWB 无感解锁，靠近即开，离开自动上锁", "小米手表 / 手环、Apple Watch、iPhone 与小米手机全部支持", "共享钥匙支持驾驶 / 仅解锁 / 代客三种权限"]
                : ["UWB hands-free unlock on approach, auto-lock when you walk away", "Xiaomi Watch / Band, Apple Watch, iPhone and Xiaomi phones supported", "Shared keys with Drive, Unlock-only and Valet permissions"]
              ).map((s) => (
                <li key={s} className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-success" />{s}</li>
              ))}
            </ul>
            <Button href="/connect/keys" className="mt-8" iconRight={<ArrowRight className="size-4" />}>{t.connect.openFeature}</Button>
          </div>
        </Container>
      </section>
    </div>
  );
}
