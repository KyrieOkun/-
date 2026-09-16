import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Headphones, Mail, MapPin, Siren } from "lucide-react";
import { getI18n } from "@/lib/i18n/server";
import { contact, faqs } from "@/data/site";
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
          <p className="mt-4 max-w-2xl text-pretty text-base leading-7 text-slate sm:text-lg">{t.support.subtitle}</p>
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
      <section id="accessibility" className="scroll-mt-20 py-12">
        <Container>
          <SectionHeading eyebrow={t.footer.accessibility} title={zh ? "无障碍声明" : "Accessibility statement"} />
          <div className="mt-6 max-w-3xl space-y-3 text-sm leading-7 text-graphite">
            <p>{zh ? "本站按 WCAG 2.1 AA 标准设计与验证：全站键盘可达、可见焦点、屏幕阅读器可读的表单与状态提示、文本对比度不低于 4.5:1，并尊重系统的“减少动态效果”设置。" : "This site is designed and tested against WCAG 2.1 AA: fully keyboard operable, visible focus, screen-reader readable forms and status messages, text contrast of at least 4.5:1, and respect for the system reduced-motion preference."}</p>
            <p>{zh ? `如遇任何无障碍问题，请发送邮件至 ${contact.email} 或拨打 ${contact.hotline}，我们会在 3 个工作日内回复并修复。` : `If you encounter an accessibility barrier, email ${contact.email} or call ${contact.hotline}; we respond and fix within three business days.`}</p>
          </div>
        </Container>
      </section>
      <section id="contact" className="scroll-mt-20 bg-cloud py-16 lg:py-24">
        <Container>
          <SectionHeading eyebrow={t.support.contact} title={t.support.contact} subtitle={t.support.hours} />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: <Headphones className="size-5" />, title: t.support.hotline, value: contact.hotline, href: `tel:${contact.hotline.replace(/-/g, "")}` },
              { icon: <Siren className="size-5" />, title: t.support.roadside, value: contact.roadside, href: `tel:${contact.roadside.replace(/-/g, "")}` },
              { icon: <Mail className="size-5" />, title: t.support.emailUs, value: contact.email, href: `mailto:${contact.email}` },
              { icon: <MapPin className="size-5" />, title: t.support.serviceCenters, value: pick(contact.networkClaim, locale), href: "/stores" },
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
