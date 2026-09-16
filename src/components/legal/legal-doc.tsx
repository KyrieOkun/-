import type { LegalDoc } from "@/data/legal";
import { pick, type Locale } from "@/lib/i18n/types";
import { Container, Eyebrow } from "@/components/ui/primitives";
import { formatDate } from "@/lib/utils";

export function LegalDocument({ doc, locale }: { doc: LegalDoc; locale: Locale }) {
  return (
    <div className="pt-14">
      <section className="border-b border-line bg-cloud">
        <Container className="max-w-4xl py-12 lg:py-16">
          <Eyebrow className="mb-3">{locale === "zh" ? "法律" : "Legal"}</Eyebrow>
          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">{pick(doc.title, locale)}</h1>
          <p className="mt-3 text-sm text-slate">{locale === "zh" ? "更新日期" : "Last updated"}: {formatDate(doc.updated, locale)}</p>
          <p className="mt-6 text-pretty text-base leading-7 text-graphite">{pick(doc.intro, locale)}</p>
        </Container>
      </section>
      <Container className="max-w-4xl py-12 pb-24 lg:grid lg:grid-cols-[220px_1fr] lg:gap-12">
        <nav className="mb-8 lg:sticky lg:top-24 lg:mb-0 lg:h-fit" aria-label={locale === "zh" ? "目录" : "Contents"}>
          <ul className="space-y-2 text-sm">
            {doc.sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="text-graphite hover:text-ink hover:underline underline-offset-4">{pick(s.title, locale)}</a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="prose-brand">
          {doc.sections.map((s) => (
            <section key={s.id} id={s.id} className="scroll-mt-24">
              <h2>{pick(s.title, locale)}</h2>
              {s.paragraphs.map((p, i) => (
                <p key={i}>{pick(p, locale)}</p>
              ))}
              {s.bullets ? (
                <ul>
                  {s.bullets.map((b) => (
                    <li key={b.zh}>{pick(b, locale)}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </div>
      </Container>
    </div>
  );
}
