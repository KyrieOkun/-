import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Headphones, Mail, MapPin, Siren } from "lucide-react";
import { getI18n } from "@/lib/i18n/server";
import { faqs } from "@/data/site";
import { Container, Eyebrow, SectionHeading } from "@/components/ui/primitives";
import { FaqList } from "@/components/support/faq-list";
import { absoluteUrl } from "@/lib/utils";
import { pick } from "@/lib/i18n/types";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.support.title, description: t.support.subtitle, alternates: { canonical: "/support" } };
}

export default async function SupportPage() {
  const { t, locale } = await getI18n();
  const zh = locale === "zh";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    url: absoluteUrl("/support"),
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: pick(f.q, locale), acceptedAnswer: { "@type": "Answer", text: pick(f.a, locale) } })),
  };
  const quick = [
    { href: "/service", title: t.connect.service, body: zh ? "保养、维修、取送车与上门充电" : "Maintenance, repairs, valet and mobile charging" },
    { href: "/order", title: t.order.lookup, body: zh ? "查看订单进度与交付安排" : "Track order progress and delivery" },
    { href: "/connect/garage", title: t.connect.garage, body: zh ? "车辆状态、远程控制与软件版本" : "Vehicle status, remote controls and software" },
    { href: "/stores", title: t.nav.stores, body: zh ? "体验、交付与服务中心" : "Experience, delivery and service centres" },
  ];
  return (
    <div className="pt-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="border-b border-line bg-cloud">
        <Container className="py-12 lg:py-16">
          <Eyebrow className="mb-3">{t.nav.xiaomi} × {t.nav.tesla}</Eyebrow>
          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">{t.support.title}</h1>
          <p className="mt-4 max-w-2xl text-pretty text-base leading-7 text-graphite sm:text-lg">{t.support.subtitle}</p>
        </Container>
      </section>
      <Container className="py-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quick.map((q) => (
            <Link key={q.href} href={q.href} className="group rounded-3xl bg-white p-6 hairline transition-shadow hover:shadow-soft">
              <h2 className="flex items-center justify-between font-semibold">{q.title}<ArrowRight className="size-4 text-ash transition-transform group-hover:translate-x-0.5" /></h2>
              <p className="mt-2 text-sm text-slate">{q.body}</p>
            </Link>
          ))}
        </div>
      </Container>
      <Container className="py-12">
        <SectionHeading eyebrow={t.support.faq} title={t.support.faq} />
        <div className="mt-8">
          <FaqList faqs={faqs} />
        </div>
      </Container>
      <section id="contact" className="scroll-mt-20 bg-cloud py-16 lg:py-24">
        <Container>
          <SectionHeading eyebrow={t.support.contact} title={t.support.contact} subtitle={t.support.hours} />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: <Headphones className="size-5" />, title: t.support.hotline, value: "400-800-0000", href: "tel:4008000000" },
              { icon: <Siren className="size-5" />, title: t.support.roadside, value: "400-800-0001", href: "tel:4008000001" },
              { icon: <Mail className="size-5" />, title: t.support.emailUs, value: "care@mitesla-atelier.com", href: "mailto:care@mitesla-atelier.com" },
              { icon: <MapPin className="size-5" />, title: t.support.serviceCenters, value: zh ? "全国 300+ 服务中心" : "300+ centres nationwide", href: "/stores" },
            ].map((c) => (
              <a key={c.title} href={c.href} className="rounded-3xl bg-white p-6 hairline transition-shadow hover:shadow-soft">
                <span className="flex size-10 items-center justify-center rounded-2xl bg-mist">{c.icon}</span>
                <p className="mt-4 text-sm text-slate">{c.title}</p>
                <p className="mt-1 font-semibold">{c.value}</p>
              </a>
            ))}
          </div>
        </Container>
      </section>
    </div>
  );
}
