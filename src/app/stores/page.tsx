import type { Metadata } from "next";
import Image from "next/image";
import { Clock, MapPin, Phone } from "lucide-react";
import { getI18n } from "@/lib/i18n/server";
import { pick } from "@/lib/i18n/types";
import { stores } from "@/data/site";
import { cityById } from "@/data/cities";
import { Badge, Container, Eyebrow } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.stores.title, description: t.stores.subtitle, alternates: { canonical: "/stores" } };
}

export default async function StoresPage() {
  const { t, locale } = await getI18n();
  const grouped = stores.reduce<Record<string, typeof stores>>((acc, s) => {
    (acc[s.cityId] ??= []).push(s);
    return acc;
  }, {});
  return (
    <div className="pt-14">
      <section className="relative overflow-hidden bg-carbon text-white">
        <Image src="/images/stores/hero.jpg" alt={t.stores.title} fill sizes="100vw" className="object-cover opacity-60" />
        <div className="scrim-b absolute inset-x-0 bottom-0 h-full" />
        <Container className="relative py-24 lg:py-32">
          <Eyebrow tone="light" className="mb-3">{t.nav.xiaomi} × {t.nav.tesla}</Eyebrow>
          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">{t.stores.title}</h1>
          <p className="mt-4 max-w-2xl text-pretty text-base leading-7 text-white/80 sm:text-lg">{t.stores.subtitle}</p>
        </Container>
      </section>
      <Container className="py-12 pb-24">
        <div className="space-y-12">
          {Object.entries(grouped).map(([cityId, list]) => (
            <section key={cityId}>
              <h2 className="text-2xl font-semibold">{pick(cityById[cityId].name, locale)} <span className="ml-2 text-sm font-normal text-slate">{pick(cityById[cityId].province, locale)}</span></h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {list.map((s) => (
                  <article key={s.id} className="flex flex-col rounded-3xl bg-white p-6 hairline">
                    <div className="flex flex-wrap gap-2">
                      <Badge tone="dark">{t.stores.type[s.type]}</Badge>
                      {s.brands.map((b) => (
                        <Badge key={b} tone={b === "xiaomi" ? "mi" : "tesla"}>{b === "xiaomi" ? t.nav.xiaomi : t.nav.tesla}</Badge>
                      ))}
                    </div>
                    <h3 className="mt-4 text-lg font-semibold">{pick(s.name, locale)}</h3>
                    <dl className="mt-3 space-y-1.5 text-sm text-graphite">
                      <div className="flex gap-2"><MapPin className="mt-0.5 size-4 shrink-0 text-ash" /><dd>{pick(s.address, locale)}</dd></div>
                      <div className="flex gap-2"><Clock className="mt-0.5 size-4 shrink-0 text-ash" /><dd>{t.stores.hours} {s.hours}</dd></div>
                      <div className="flex gap-2"><Phone className="mt-0.5 size-4 shrink-0 text-ash" /><dd><a href={`tel:${s.phone.replace(/-/g, "")}`} className="hover:underline">{s.phone}</a></dd></div>
                    </dl>
                    <p className="mt-3 text-xs text-slate">{s.services.map((x) => pick(x, locale)).join(" · ")}</p>
                    <div className="mt-auto flex gap-2 pt-5">
                      <Button href={`/test-drive`} size="sm" className="flex-1">{t.stores.book}</Button>
                      <Button href={`https://uri.amap.com/search?keyword=${encodeURIComponent(pick(s.name, locale))}`} external size="sm" variant="secondary" className="flex-1">{t.charging.navigate}</Button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </Container>
    </div>
  );
}
