import Link from "next/link";
import { getDictionary, type Locale } from "@/lib/i18n";
import { NewsletterForm } from "./newsletter-form";

interface FooterVehicle {
  slug: string;
  brand: "xiaomi" | "tesla";
  name: string;
}

export function SiteFooter({ locale, vehicles }: { locale: Locale; vehicles: FooterVehicle[] }) {
  const t = getDictionary(locale);
  const year = new Date().getFullYear();
  // Server component: prefer runtime variables so Docker deployments can set
  // them at `docker run` time; the NEXT_PUBLIC_ variants are build-time fallbacks.
  const icp = process.env.ICP_LICENSE ?? process.env.NEXT_PUBLIC_ICP;
  const psb = process.env.PSB_LICENSE ?? process.env.NEXT_PUBLIC_PSB;

  const columns: { title: string; links: { href: string; label: string }[] }[] = [
    {
      title: t.footer.vehicles,
      links: vehicles.map((v) => ({ href: `/vehicles/${v.slug}`, label: v.name })),
    },
    {
      title: t.footer.ownership,
      links: [
        { href: "/test-drive", label: t.nav.testDrive },
        { href: "/order", label: t.nav.order },
        { href: "/trade-in", label: t.nav.tradeIn },
        { href: "/charging", label: t.nav.charging },
        { href: "/service", label: t.nav.service },
        { href: "/stores", label: t.nav.stores },
        { href: "/support", label: t.nav.support },
      ],
    },
    {
      title: t.footer.connect,
      links: [
        { href: "/connect", label: t.connect.title },
        { href: "/connect/garage", label: t.connect.garage },
        { href: "/connect/trip-planner", label: t.connect.trip },
        { href: "/connect/keys", label: t.connect.keys },
        { href: "/connect/ecosystem", label: t.connect.ecosystem },
        { href: "/connect/ota", label: t.connect.ota },
      ],
    },
    {
      title: t.footer.company,
      links: [
        { href: "/atelier", label: t.nav.atelier },
        { href: "/news", label: t.nav.news },
        { href: "/support#contact", label: t.footer.contact },
        { href: "/legal/terms", label: t.footer.terms },
        { href: "/legal/privacy", label: t.footer.privacy },
        { href: "/legal/privacy#cookies", label: t.footer.cookies },
      ],
    },
  ];

  return (
    <footer className="border-t border-line bg-white text-ink">
      <div className="container-x py-14 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold tracking-[0.28em]">MI</span>
              <span className="text-xs text-slate">×</span>
              <span className="text-lg font-bold tracking-[0.28em]">TESLA</span>
              <span className="ml-1 text-[10px] font-semibold tracking-[0.3em] text-ash">ATELIER</span>
            </div>
            <p className="mt-3 max-w-sm text-sm leading-6 text-slate">{t.brand.tagline}</p>
            <div className="mt-8">
              <p className="text-sm font-semibold">{t.footer.newsletter}</p>
              <p className="mt-1 text-xs text-slate">{t.footer.newsletterHint}</p>
              <NewsletterForm />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {columns.map((col) => (
              <div key={col.title}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ash">{col.title}</p>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.href + link.label}>
                      <Link href={link.href} className="text-sm text-graphite transition-colors hover:text-ink" prefetch={false}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 border-t border-line pt-6">
          <p className="max-w-4xl text-xs leading-5 text-ash">{t.footer.disclaimer}</p>
          <div className="mt-4 flex flex-col gap-3 text-xs text-ash sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {year} MI × TESLA ATELIER. {t.footer.copyright}. · {t.footer.region}
              {icp ? (
                <>
                  {" · "}
                  <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer" className="hover:text-ink">
                    {icp}
                  </a>
                </>
              ) : null}
              {psb ? <> · {psb}</> : null}
            </p>
            <div className="flex gap-4">
              <Link href="/legal/privacy" className="hover:text-ink">{t.footer.privacy}</Link>
              <Link href="/legal/terms" className="hover:text-ink">{t.footer.terms}</Link>
              <Link href="/support" className="hover:text-ink">{t.footer.accessibility}</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
