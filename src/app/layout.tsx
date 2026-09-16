import type { Metadata, Viewport } from "next";
import "./globals.css";
import { getLocale } from "@/lib/i18n/server";
import { getDictionary, localeToLang } from "@/lib/i18n";
import { LocaleProvider } from "@/lib/i18n/provider";
import { HeaderThemeProvider } from "@/components/layout/header-theme";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { vehicles, getStartingPrice } from "@/data/vehicles";
import { getCurrentUser } from "@/lib/auth";
import { SITE_URL } from "@/lib/utils";
import { pick } from "@/lib/i18n/types";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = getDictionary(locale);
  const modelNames = vehicles.filter((v) => v.availability !== "overseas").map((v) => pick(v.name, locale));
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: `${t.brand.name} | ${t.brand.short}`,
      template: `%s | ${t.brand.short}`,
    },
    description: locale === "zh"
      ? `小米汽车 × 特斯拉 官方联名高级定制中心：${modelNames.join("、")} 在线选配、跨品牌充电互通、行程规划、数字钥匙与生态互联。`
      : `The official Xiaomi EV × Tesla bespoke atelier: configure ${modelNames.join(", ")} online with cross-brand charging, trip planning, digital keys and ecosystem integration.`,
    applicationName: t.brand.short,
    keywords: locale === "zh" ? ["小米汽车", "特斯拉", "高级定制", "联名", ...modelNames] : ["Xiaomi EV", "Tesla", "bespoke", "atelier", ...modelNames],
    openGraph: {
      type: "website",
      siteName: t.brand.short,
      locale: locale === "zh" ? "zh_CN" : "en_US",
      url: SITE_URL,
      title: t.brand.name,
      description: t.brand.tagline,
    },
    twitter: { card: "summary_large_image", title: t.brand.name, description: t.brand.tagline },
    robots: { index: true, follow: true },
    icons: { icon: [{ url: "/icon.svg", type: "image/svg+xml" }] },
    manifest: "/manifest.webmanifest",
    formatDetection: { telephone: false },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0c0e" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  const user = await getCurrentUser().catch(() => null);

  const headerVehicles = vehicles.map((v) => ({
    slug: v.slug,
    brand: v.brand,
    name: v.name,
    tagline: v.tagline,
    price: getStartingPrice(v),
    hero: v.hero.src,
    availability: v.availability,
  }));
  const footerVehicles = vehicles.map((v) => ({ slug: v.slug, brand: v.brand, name: pick(v.name, locale) }));
  // Routes whose first section is a full-bleed hero: lets the header render
  // transparent on the server so there is no solid-to-transparent flash.
  const heroRoutes: Record<string, "overlay" | "overlay-dark"> = {
    "/": "overlay",
    "/charging": "overlay",
    "/connect": "overlay",
    "/atelier": "overlay",
    ...Object.fromEntries(vehicles.map((v) => [`/vehicles/${v.slug}`, v.theme === "light" ? "overlay-dark" : "overlay"])),
  };

  return (
    <html lang={localeToLang(locale)}>
      <body className="min-h-dvh flex flex-col">
        <LocaleProvider locale={locale} dictionary={getDictionary(locale)}>
          <HeaderThemeProvider>
            <SiteHeader vehicles={headerVehicles} user={user ? { name: user.name } : null} heroRoutes={heroRoutes} />
            <main id="main" className="flex-1">
              {children}
            </main>
            <SiteFooter locale={locale} vehicles={footerVehicles} />
          </HeaderThemeProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
