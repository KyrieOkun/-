import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getI18n } from "@/lib/i18n/server";
import { pick } from "@/lib/i18n/types";
import { articles, type NewsCategory } from "@/data/news";
import { Badge, Container, Eyebrow } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/reveal";
import { cn, formatDate } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.news.title, description: t.news.subtitle, alternates: { canonical: "/news" } };
}

const CATEGORIES: ("all" | NewsCategory)[] = ["all", "launch", "software", "charging", "event", "atelier"];

export default async function NewsPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { t, locale } = await getI18n();
  const { category } = await searchParams;
  const active = CATEGORIES.includes(category as NewsCategory) ? (category as NewsCategory | "all") : "all";
  const list = articles.filter((a) => (active === "all" ? true : a.category === active));
  const [lead, ...rest] = list;

  return (
    <div className="pt-14">
      <section className="border-b border-line bg-cloud">
        <Container className="py-12 lg:py-16">
          <Eyebrow className="mb-3">{t.nav.discover}</Eyebrow>
          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">{t.news.title}</h1>
          <p className="mt-4 max-w-2xl text-pretty text-base leading-7 text-graphite sm:text-lg">{t.news.subtitle}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <Link key={c} href={c === "all" ? "/news" : `/news?category=${c}`} className={cn("h-9 rounded-pill px-4 text-sm font-medium leading-9 transition-colors", active === c ? "bg-ink text-white" : "bg-white text-graphite hairline hover:bg-mist")}>
                {c === "all" ? t.common.all : t.news.category[c]}
              </Link>
            ))}
          </div>
        </Container>
      </section>
      <Container className="py-12 pb-24">
        {lead ? (
          <Link href={`/news/${lead.slug}`} className="group grid gap-6 overflow-hidden rounded-3xl bg-white hairline lg:grid-cols-2">
            <div className="relative aspect-[16/10] bg-mist lg:aspect-auto lg:min-h-[400px]">
              <Image src={lead.image} alt="" fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
            </div>
            <div className="flex flex-col justify-center p-8 lg:p-12">
              <div className="flex items-center gap-2 text-xs text-slate">
                <Badge tone={lead.brand === "xiaomi" ? "mi" : lead.brand === "tesla" ? "tesla" : "neutral"}>{t.news.category[lead.category]}</Badge>
                <time dateTime={lead.date}>{formatDate(lead.date, locale)}</time>
                <span>· {lead.readMinutes} {t.news.readTime}</span>
              </div>
              <h2 className="mt-4 text-balance text-2xl font-semibold leading-snug sm:text-3xl group-hover:underline underline-offset-4">{pick(lead.title, locale)}</h2>
              <p className="mt-4 text-pretty text-base leading-7 text-graphite">{pick(lead.excerpt, locale)}</p>
            </div>
          </Link>
        ) : null}
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((a, i) => (
            <Reveal key={a.slug} delay={(i % 3) * 60} as="article">
              <Link href={`/news/${a.slug}`} className="group block">
                <div className="relative aspect-[16/10] overflow-hidden rounded-3xl bg-mist">
                  <Image src={a.image} alt="" fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                </div>
                <div className="mt-4 flex items-center gap-2 text-xs text-slate">
                  <Badge tone={a.brand === "xiaomi" ? "mi" : a.brand === "tesla" ? "tesla" : "neutral"}>{t.news.category[a.category]}</Badge>
                  <time dateTime={a.date}>{formatDate(a.date, locale)}</time>
                </div>
                <h3 className="mt-2 text-lg font-semibold leading-snug group-hover:underline underline-offset-4">{pick(a.title, locale)}</h3>
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-graphite">{pick(a.excerpt, locale)}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>
    </div>
  );
}
