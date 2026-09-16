import type { Metadata } from "next";
import { getI18n } from "@/lib/i18n/server";
import { pick } from "@/lib/i18n/types";
import { otaReleases } from "@/data/connect";
import { Badge, Container, Eyebrow } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { formatDate, cn } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.connect.otaTitle, description: t.connect.otaSubtitle, alternates: { canonical: "/connect/ota" } };
}

export default async function OtaPage() {
  const { t, locale } = await getI18n();
  const releases = [...otaReleases].sort((a, b) => b.date.localeCompare(a.date));
  const statusLabel = {
    rolling: locale === "zh" ? "推送中" : "Rolling out",
    released: locale === "zh" ? "已发布" : "Released",
    scheduled: locale === "zh" ? "计划中" : "Scheduled",
  } as const;
  return (
    <div className="pt-14">
      <section className="border-b border-line bg-cloud">
        <Container className="py-12 lg:py-16">
          <Eyebrow className="mb-3">{t.connect.title}</Eyebrow>
          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">{t.connect.otaTitle}</h1>
          <p className="mt-4 max-w-2xl text-pretty text-base leading-7 text-slate sm:text-lg">{t.connect.otaSubtitle}</p>
          <div className="mt-6 flex gap-3">
            <Button href="/connect/garage" variant="outline">{t.connect.garage}</Button>
            <Button href="/news?category=software" variant="secondary">{t.nav.news}</Button>
          </div>
        </Container>
      </section>
      <Container className="py-12 pb-24">
        <ol className="relative space-y-6 border-l border-line pl-8">
          {releases.map((r) => (
            <li key={r.id} className="relative">
              <span className={cn("absolute -left-[41px] top-6 size-4 rounded-full border-4 border-white", r.brand === "xiaomi" ? "bg-mi" : "bg-tesla")} />
              <article className="rounded-3xl bg-white p-6 hairline">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={r.brand === "xiaomi" ? "mi" : "tesla"}>{r.brand === "xiaomi" ? t.nav.xiaomi : t.nav.tesla}</Badge>
                  <Badge tone={r.status === "rolling" ? "success" : r.status === "scheduled" ? "gold" : "neutral"}>{statusLabel[r.status]}</Badge>
                  <time dateTime={r.date} className="text-xs text-ash">{formatDate(r.date, locale)}</time>
                </div>
                <p className="mt-3 font-mono text-sm text-slate">{r.version}</p>
                <h2 className="mt-1 text-xl font-semibold">{pick(r.title, locale)}</h2>
                <ul className="mt-4 list-disc space-y-1.5 pl-5 text-sm leading-6 text-graphite">
                  {r.notes.map((n) => (
                    <li key={n.zh}>{pick(n, locale)}</li>
                  ))}
                </ul>
              </article>
            </li>
          ))}
        </ol>
      </Container>
    </div>
  );
}
