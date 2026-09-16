import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getI18n } from "@/lib/i18n/server";
import { pick } from "@/lib/i18n/types";
import { articles, articlesBySlug } from "@/data/news";
import { Badge, Container } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { absoluteUrl, formatDate, jsonLd as toJsonLd } from "@/lib/utils";

interface Params {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const article = articlesBySlug[slug];
  if (!article) return {};
  const { locale } = await getI18n();
  return {
    title: pick(article.title, locale),
    description: pick(article.excerpt, locale),
    alternates: { canonical: `/news/${article.slug}` },
    openGraph: { type: "article", publishedTime: article.date, title: pick(article.title, locale), description: pick(article.excerpt, locale), images: [{ url: article.image }] },
  };
}

export default async function ArticlePage({ params }: Params) {
  const { slug } = await params;
  const article = articlesBySlug[slug];
  if (!article) notFound();
  const { t, locale } = await getI18n();
  const related = (article.related ?? []).map((s) => articlesBySlug[s]).filter(Boolean);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: pick(article.title, locale),
    datePublished: article.date,
    image: [absoluteUrl(article.image)],
    description: pick(article.excerpt, locale),
    dateModified: article.date,
    author: { "@type": "Organization", name: "MI × TESLA ATELIER", url: absoluteUrl("/") },
    publisher: { "@type": "Organization", name: "MI × TESLA ATELIER", logo: { "@type": "ImageObject", url: absoluteUrl("/icons/512") } },
    mainEntityOfPage: absoluteUrl(`/news/${article.slug}`),
    inLanguage: locale === "zh" ? "zh-CN" : "en",
  };

  return (
    <article className="pt-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: toJsonLd(jsonLd) }} />
      <Container className="max-w-4xl py-12 lg:py-16">
        <Link href="/news" className="inline-flex items-center gap-1 text-sm text-graphite hover:underline underline-offset-4"><ArrowLeft className="size-4" />{t.news.title}</Link>
        <div className="mt-6 flex items-center gap-2 text-xs text-slate">
          <Badge tone={article.brand === "xiaomi" ? "mi" : article.brand === "tesla" ? "tesla" : "neutral"}>{t.news.category[article.category]}</Badge>
          <time dateTime={article.date}>{formatDate(article.date, locale)}</time>
          <span>· {article.readMinutes} {t.news.readTime}</span>
        </div>
        <h1 className="mt-4 text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">{pick(article.title, locale)}</h1>
        <p className="mt-5 text-pretty text-lg leading-8 text-slate">{pick(article.excerpt, locale)}</p>
      </Container>
      <Container className="max-w-6xl">
        <div className="relative aspect-[16/8] overflow-hidden rounded-3xl bg-mist">
          <Image src={article.image} alt={pick(article.title, locale)} fill priority sizes="(min-width: 1152px) 1152px, 100vw" className="object-cover" />
        </div>
      </Container>
      <Container className="max-w-3xl py-12 lg:py-16">
        <div className="prose-brand">
          {article.body.map((p, i) => (
            <p key={i} className="text-[17px] leading-8">{pick(p, locale)}</p>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap gap-3 border-t border-line pt-8">
          <Button href="/vehicles">{t.nav.allVehicles}</Button>
          <Button href="/test-drive" variant="secondary">{t.nav.testDrive}</Button>
        </div>
      </Container>
      {related.length ? (
        <Container className="max-w-6xl pb-24">
          <h2 className="text-xl font-semibold">{t.news.related}</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => (
              <Link key={r.slug} href={`/news/${r.slug}`} className="group block">
                <div className="relative aspect-[16/10] overflow-hidden rounded-3xl bg-mist">
                  <Image src={r.image} alt="" fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                </div>
                <h3 className="mt-3 text-base font-semibold leading-snug group-hover:underline underline-offset-4">{pick(r.title, locale)}</h3>
              </Link>
            ))}
          </div>
        </Container>
      ) : null}
    </article>
  );
}
