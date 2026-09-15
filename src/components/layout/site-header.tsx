"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Globe, Menu, User, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/provider";
import { useHeaderTheme } from "./header-theme";
import type { L10n } from "@/lib/i18n/types";
import { formatPriceHeadline } from "@/lib/utils";

export interface HeaderVehicle {
  slug: string;
  brand: "xiaomi" | "tesla";
  name: L10n;
  tagline: L10n;
  price: number;
  hero: string;
  availability: string;
}

export interface HeaderUser {
  name: string;
}

interface Props {
  vehicles: HeaderVehicle[];
  user: HeaderUser | null;
}

export function SiteHeader({ vehicles, user }: Props) {
  const { t, locale, pick, setLocale } = useI18n();
  const { mode } = useHeaderTheme();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [mega, setMega] = useState<null | "vehicles" | "connect" | "discover">(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setMega(null);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const transparent = mode !== "solid" && !scrolled && !mega && !open;
  const overlay = mode === "overlay" && transparent;
  const textColor = overlay ? "text-white" : "text-ink";

  const openMega = (key: typeof mega) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMega(key);
  };
  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setMega(null), 160);
  };

  const xiaomi = vehicles.filter((v) => v.brand === "xiaomi");
  const tesla = vehicles.filter((v) => v.brand === "tesla");

  const connectLinks = [
    { href: "/connect", label: t.connect.title },
    { href: "/connect/garage", label: t.connect.garage },
    { href: "/connect/trip-planner", label: t.connect.trip },
    { href: "/connect/keys", label: t.connect.keys },
    { href: "/connect/ecosystem", label: t.connect.ecosystem },
    { href: "/connect/ota", label: t.connect.ota },
    { href: "/service", label: t.connect.service },
    { href: "/trade-in", label: t.connect.tradeIn },
  ];
  const discoverLinks = [
    { href: "/news", label: t.nav.news },
    { href: "/stores", label: t.nav.stores },
    { href: "/compare", label: t.nav.compare },
    { href: "/test-drive", label: t.nav.testDrive },
    { href: "/support", label: t.nav.support },
  ];

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-pill focus:bg-ink focus:px-4 focus:py-2 focus:text-white">
        {t.a11y.skipToContent}
      </a>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
          transparent ? "bg-transparent" : "glass border-b border-ink/5",
          textColor,
        )}
        onMouseLeave={scheduleClose}
      >
        <div className="container-x flex h-14 items-center justify-between">
          <Link href="/" className="flex items-baseline gap-2 focus-ring rounded-md" aria-label={t.brand.name}>
            <span className="text-[15px] font-bold tracking-[0.28em]">MI</span>
            <span className={cn("text-[11px] font-light", overlay ? "text-white/70" : "text-slate")}>×</span>
            <span className="text-[15px] font-bold tracking-[0.28em]">TESLA</span>
            <span className={cn("ml-1 hidden text-[10px] font-semibold tracking-[0.3em] sm:inline", overlay ? "text-white/60" : "text-ash")}>ATELIER</span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
            <NavItem label={t.nav.vehicles} active={mega === "vehicles"} onEnter={() => openMega("vehicles")} href="/vehicles" />
            <NavItem label={t.nav.connect} active={mega === "connect"} onEnter={() => openMega("connect")} href="/connect" />
            <NavItem label={t.nav.charging} onEnter={() => setMega(null)} href="/charging" />
            <NavItem label={t.nav.atelier} onEnter={() => setMega(null)} href="/atelier" />
            <NavItem label={t.nav.discover} active={mega === "discover"} onEnter={() => openMega("discover")} href="/news" />
          </nav>

          <div className="flex items-center gap-1">
            <Link href="/support" className="hidden rounded-pill px-3 py-1.5 text-sm font-medium hover:bg-current/5 lg:inline-flex" onMouseEnter={() => setMega(null)}>
              {t.nav.support}
            </Link>
            <button
              type="button"
              onClick={() => setLocale(locale === "zh" ? "en" : "zh")}
              className="inline-flex h-9 items-center gap-1.5 rounded-pill px-3 text-sm font-medium hover:bg-current/5 focus-ring"
              aria-label={t.nav.language}
            >
              <Globe className="size-4" />
              <span>{locale === "zh" ? "EN" : "中文"}</span>
            </button>
            <Link href={user ? "/account" : "/account?mode=login"} className="inline-flex h-9 items-center gap-1.5 rounded-pill px-3 text-sm font-medium hover:bg-current/5 focus-ring" aria-label={t.nav.account}>
              <User className="size-4" />
              <span className="hidden sm:inline">{user ? user.name : t.nav.login}</span>
            </Link>
            <button
              type="button"
              className="inline-flex size-9 items-center justify-center rounded-pill hover:bg-current/5 focus-ring lg:hidden"
              aria-label={open ? t.a11y.closeMenu : t.a11y.openMenu}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {/* Mega menus */}
        <div
          className={cn(
            "absolute inset-x-0 top-full hidden origin-top border-b border-ink/5 bg-white text-ink shadow-lift transition-all duration-200 lg:block",
            mega ? "visible translate-y-0 opacity-100" : "invisible -translate-y-2 opacity-0",
          )}
          onMouseEnter={() => mega && openMega(mega)}
          onMouseLeave={scheduleClose}
        >
          <div className="container-x py-8">
            {mega === "vehicles" ? (
              <div className="grid grid-cols-[1fr_1fr_220px] gap-10">
                <BrandColumn title={t.nav.xiaomi} tone="mi" items={xiaomi} pick={pick} locale={locale} />
                <BrandColumn title={t.nav.tesla} tone="tesla" items={tesla} pick={pick} locale={locale} />
                <div className="border-l border-line pl-8">
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-ash">{t.nav.discover}</p>
                  <ul className="space-y-2.5 text-sm">
                    <li><Link className="hover:underline" href="/vehicles">{t.nav.allVehicles}</Link></li>
                    <li><Link className="hover:underline" href="/compare">{t.nav.compare}</Link></li>
                    <li><Link className="hover:underline" href="/test-drive">{t.nav.testDrive}</Link></li>
                    <li><Link className="hover:underline" href="/trade-in">{t.nav.tradeIn}</Link></li>
                    <li><Link className="hover:underline" href="/atelier">{t.nav.atelier}</Link></li>
                    <li><Link className="hover:underline" href="/charging">{t.nav.charging}</Link></li>
                  </ul>
                </div>
              </div>
            ) : null}
            {mega === "connect" ? (
              <div className="grid grid-cols-4 gap-6">
                {connectLinks.map((item) => (
                  <Link key={item.href} href={item.href} className="rounded-2xl p-4 transition-colors hover:bg-mist">
                    <p className="text-sm font-semibold">{item.label}</p>
                  </Link>
                ))}
              </div>
            ) : null}
            {mega === "discover" ? (
              <div className="grid grid-cols-5 gap-6">
                {discoverLinks.map((item) => (
                  <Link key={item.href} href={item.href} className="rounded-2xl p-4 transition-colors hover:bg-mist">
                    <p className="text-sm font-semibold">{item.label}</p>
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </header>

      {/* Mobile sheet */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-white text-ink transition-opacity duration-200 lg:hidden",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
        aria-hidden={!open}
      >
        <div className="h-full overflow-y-auto pt-16 pb-10">
          <div className="container-x">
            <MobileGroup title={t.nav.xiaomi} tone="mi">
              {xiaomi.map((v) => (
                <MobileVehicle key={v.slug} v={v} pick={pick} locale={locale} />
              ))}
            </MobileGroup>
            <MobileGroup title={t.nav.tesla} tone="tesla">
              {tesla.map((v) => (
                <MobileVehicle key={v.slug} v={v} pick={pick} locale={locale} />
              ))}
            </MobileGroup>
            <MobileGroup title={t.nav.connect}>
              {connectLinks.map((i) => (
                <Link key={i.href} href={i.href} className="block py-2.5 text-base">{i.label}</Link>
              ))}
            </MobileGroup>
            <MobileGroup title={t.nav.discover}>
              {[{ href: "/charging", label: t.nav.charging }, { href: "/atelier", label: t.nav.atelier }, ...discoverLinks].map((i) => (
                <Link key={i.href} href={i.href} className="block py-2.5 text-base">{i.label}</Link>
              ))}
            </MobileGroup>
            <div className="mt-6 flex gap-3">
              <Link href={user ? "/account" : "/account?mode=login"} className="flex-1 rounded-pill bg-ink px-5 py-3 text-center text-sm font-medium text-white">
                {user ? t.nav.account : t.nav.login}
              </Link>
              <button type="button" onClick={() => setLocale(locale === "zh" ? "en" : "zh")} className="flex-1 rounded-pill bg-mist px-5 py-3 text-center text-sm font-medium">
                {locale === "zh" ? "English" : "中文"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function NavItem({ label, href, active, onEnter }: { label: string; href: string; active?: boolean; onEnter: () => void }) {
  return (
    <Link
      href={href}
      onMouseEnter={onEnter}
      onFocus={onEnter}
      className={cn("inline-flex items-center gap-1 rounded-pill px-3 py-1.5 text-sm font-medium transition-colors hover:bg-current/5", active && "bg-current/5")}
    >
      {label}
    </Link>
  );
}

function BrandColumn({ title, tone, items, pick, locale }: { title: string; tone: "mi" | "tesla"; items: HeaderVehicle[]; pick: (t: L10n) => string; locale: "zh" | "en" }) {
  return (
    <div>
      <p className={cn("mb-4 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em]", tone === "mi" ? "text-mi" : "text-tesla")}>
        <span className={cn("size-1.5 rounded-full", tone === "mi" ? "bg-mi" : "bg-tesla")} />
        {title}
      </p>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-3">
        {items.map((v) => (
          <li key={v.slug}>
            <Link href={`/vehicles/${v.slug}`} className="group flex items-center gap-3 rounded-2xl p-2 transition-colors hover:bg-mist">
              <span className="relative h-12 w-20 shrink-0 overflow-hidden rounded-xl bg-mist">
                <Image src={v.hero} alt="" fill sizes="80px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold">{pick(v.name)}</span>
                <span className="block text-xs text-slate">{formatPriceHeadline(v.price, locale)} {locale === "zh" ? "起" : ""}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MobileGroup({ title, tone, children }: { title: string; tone?: "mi" | "tesla"; children: React.ReactNode }) {
  const [expanded, setExpanded] = useState(true);
  return (
    <div className="border-b border-line py-4">
      <button type="button" onClick={() => setExpanded((v) => !v)} className="flex w-full items-center justify-between py-1 text-left" aria-expanded={expanded}>
        <span className={cn("text-[11px] font-semibold uppercase tracking-[0.2em]", tone === "mi" ? "text-mi" : tone === "tesla" ? "text-tesla" : "text-ash")}>{title}</span>
        <ChevronDown className={cn("size-4 text-ash transition-transform", expanded && "rotate-180")} />
      </button>
      {expanded ? <div className="mt-2">{children}</div> : null}
    </div>
  );
}

function MobileVehicle({ v, pick, locale }: { v: HeaderVehicle; pick: (t: L10n) => string; locale: "zh" | "en" }) {
  return (
    <Link href={`/vehicles/${v.slug}`} className="flex items-center justify-between py-2.5">
      <span className="text-base font-medium">{pick(v.name)}</span>
      <span className="text-xs text-slate">{formatPriceHeadline(v.price, locale)}</span>
    </Link>
  );
}
