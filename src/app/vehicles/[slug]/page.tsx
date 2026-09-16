import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import { getI18n } from "@/lib/i18n/server";
import { pick } from "@/lib/i18n/types";
import { vehicles, getVehicle, getStartingPrice } from "@/data/vehicles";
import { HeroOverlay } from "@/components/layout/header-theme";
import { Button } from "@/components/ui/button";
import { Badge, Container, Eyebrow, SectionHeading, Stat } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/reveal";
import { Icon } from "@/components/ui/icon";
import { PaintExplorer } from "@/components/vehicles/paint-explorer";
import { VehicleCard } from "@/components/vehicles/vehicle-card";
import { InterestForm } from "@/components/forms/interest-form";
import { formatCNY, formatDate, formatPriceHeadline, formatUSD, absoluteUrl, formatPriceFrom, jsonLd as toJsonLd } from "@/lib/utils";

interface Params {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return vehicles.map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const vehicle = getVehicle(slug);
  if (!vehicle) return {};
  const { locale } = await getI18n();
  const title = `${pick(vehicle.name, locale)} · ${pick(vehicle.tagline, locale)}`;
  return {
    title,
    description: pick(vehicle.description, locale),
    alternates: { canonical: `/vehicles/${vehicle.slug}` },
    openGraph: { title, description: pick(vehicle.description, locale), images: [{ url: vehicle.hero.src }] },
  };
}

export default async function VehiclePage({ params }: Params) {
  const { slug } = await params;
  const vehicle = getVehicle(slug);
  if (!vehicle) notFound();
  const { locale, t } = await getI18n();
  const isOverseas = vehicle.availability === "overseas";
  const isInventory = vehicle.availability === "inventory";
  const related = vehicles.filter((v) => v.slug !== vehicle.slug && (v.bodyType === vehicle.bodyType || v.brand !== vehicle.brand)).slice(0, 3);
  const startingPrice = getStartingPrice(vehicle);
  const light = vehicle.theme === "light";
  // The hero already fills the first viewport; don't repeat it in the gallery unless it is the only photo.
  const gallery = vehicle.images.filter((img) => img.src !== vehicle.hero.src).length > 0 ? vehicle.images.filter((img) => img.src !== vehicle.hero.src) : vehicle.images;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Car",
    name: pick(vehicle.name, locale),
    brand: { "@type": "Brand", name: vehicle.brand === "xiaomi" ? "Xiaomi EV" : "Tesla" },
    description: pick(vehicle.description, locale),
    image: absoluteUrl(vehicle.hero.src),
    url: absoluteUrl(`/vehicles/${vehicle.slug}`),
    vehicleConfiguration: vehicle.trims.map((tr) => pick(tr.name, locale)).join(" / "),
    // Overseas-only models have no CN offer yet; don't advertise a converted price.
    ...(isOverseas
      ? {}
      : {
          offers: vehicle.trims.map((tr) => ({
            "@type": "Offer",
            name: pick(tr.name, locale),
            price: tr.price,
            priceCurrency: "CNY",
            availability: isInventory ? "https://schema.org/LimitedAvailability" : "https://schema.org/InStock",
            url: absoluteUrl(isInventory ? `/order?vehicle=${vehicle.slug}&trim=${tr.id}` : `/vehicles/${vehicle.slug}/design?trim=${tr.id}`),
            itemCondition: "https://schema.org/NewCondition",
          })),
        }),
  };

  return (
    <div>
      <HeroOverlay tone={vehicle.theme} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: toJsonLd(jsonLd) }} />

      {/* Hero */}
      <section className={`relative flex min-h-[100svh] flex-col overflow-hidden ${light ? "bg-mist text-ink" : "bg-carbon text-white"}`}>
        {/* On phones the photo sits above the copy on a solid panel; from `sm` up the copy overlays the photo. */}
        <div className="relative h-[54svh] shrink-0 sm:absolute sm:inset-0 sm:h-auto">
          <Image src={vehicle.hero.src} alt={pick(vehicle.hero.alt, locale)} fill priority sizes="100vw" className="object-cover" />
          {light ? (
            <>
              <div className="pointer-events-none absolute inset-x-0 top-0 h-2/5 bg-gradient-to-b from-white/70 via-white/25 to-transparent" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-mist to-transparent sm:h-3/5 sm:from-white/90 sm:via-white/45" />
            </>
          ) : (
            <>
              <div className="scrim-t pointer-events-none absolute inset-x-0 top-0 h-2/5" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-carbon to-transparent sm:hidden" />
              <div className="scrim-b pointer-events-none absolute inset-x-0 bottom-0 hidden h-3/5 sm:block" />
            </>
          )}
        </div>
        <div className="relative flex flex-1 flex-col justify-end px-5 pb-12 pt-4 sm:px-8 sm:pt-32 lg:px-12">
          <Reveal className="max-w-3xl">
            <p className={`mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.28em] ${light ? "text-graphite" : "text-white/70"}`}>
              <span className={vehicle.brand === "xiaomi" ? "size-1.5 rounded-full bg-mi" : "size-1.5 rounded-full bg-tesla"} />
              {vehicle.brand === "xiaomi" ? t.nav.xiaomi : t.nav.tesla} · {pick(vehicle.segment, locale)}
            </p>
            <h1 className="text-balance text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">{pick(vehicle.name, locale)}</h1>
            <p className={`mt-3 text-pretty text-lg sm:text-2xl ${light ? "text-graphite" : "text-white/80"}`}>{pick(vehicle.tagline, locale)}</p>
          </Reveal>
          <Reveal delay={120} className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4">
            {vehicle.highlights.map((h) => (
              <Stat key={h.label.zh} value={h.value} unit={typeof h.unit === "string" ? h.unit : h.unit ? pick(h.unit, locale) : undefined} label={pick(h.label, locale)} tone={light ? "dark" : "light"} />
            ))}
          </Reveal>
          <Reveal delay={200} className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            {!isOverseas ? (
              <>
                <Button href={isInventory ? `/order?vehicle=${vehicle.slug}` : `/vehicles/${vehicle.slug}/design`} variant={light ? "primary" : "light"} size="lg" className="sm:w-56">{isInventory ? (locale === "zh" ? "选购现车" : "Shop inventory") : t.vehicles.designCta}</Button>
                <Button href={`/test-drive?vehicle=${vehicle.slug}`} variant={light ? "light" : "glass"} size="lg" className={`sm:w-56 ${light ? "bg-white/70 backdrop-blur-md hover:bg-white" : ""}`}>{t.vehicles.testDriveCta}</Button>
              </>
            ) : (
              <Button href="#interest" variant="light" size="lg" className="sm:w-56">{locale === "zh" ? "登记关注" : "Register interest"}</Button>
            )}
            <span className={`text-sm sm:ml-4 ${light ? "text-graphite" : "text-white/70"}`}>
              {formatPriceFrom(startingPrice, locale)}
              {isOverseas && vehicle.trims[0].priceUSD ? ` (${formatUSD(vehicle.trims[0].priceUSD)})` : ""}
              {isInventory ? ` · ${t.common.inventoryOnly}` : ""}
            </span>
          </Reveal>
        </div>
      </section>

      {/* Sub nav */}
      <nav className="sticky top-14 z-30 border-b border-line bg-white/85 backdrop-blur" aria-label={t.a11y.sectionsNav}>
        <Container className="no-scrollbar flex items-center gap-6 overflow-x-auto py-3 text-sm">
          {[
            ["#overview", t.nav.learnMore],
            ["#trims", t.vehicles.trims],
            ["#features", t.vehicles.highlights],
            ["#design", t.vehicles.colors],
            ["#gallery", t.vehicles.gallery],
            ["#specs", t.vehicles.specs],
          ].map(([href, label]) => (
            <a key={href} href={href} className="whitespace-nowrap font-medium text-graphite hover:text-ink">{label}</a>
          ))}
          <span className="ml-auto hidden items-center gap-2 sm:flex">
            <span className="text-graphite">{formatPriceHeadline(startingPrice, locale)} {locale === "zh" ? "起" : ""}</span>
            {!isOverseas ? (
              <Link href={`/vehicles/${vehicle.slug}/design`} className="rounded-pill bg-ink px-4 py-1.5 text-xs font-medium text-white">{t.vehicles.designCta}</Link>
            ) : null}
          </span>
        </Container>
      </nav>

      {/* Overview */}
      <section id="overview" className="scroll-mt-28 py-20 lg:py-28">
        <Container className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
          <Reveal>
            <Eyebrow className="mb-3">{pick(vehicle.series, locale)}</Eyebrow>
            <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">{pick(vehicle.tagline, locale)}</h2>
            <div className="mt-6 flex flex-wrap gap-2">
              {vehicle.tags.map((tag) => (
                <Badge key={tag.zh} tone="neutral">{pick(tag, locale)}</Badge>
              ))}
            </div>
          </Reveal>
          <Reveal delay={80}>
            <p className="text-pretty text-lg leading-8 text-graphite">{pick(vehicle.description, locale)}</p>
            <dl className="mt-8 grid grid-cols-2 gap-6 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-ash">{t.vehicles.launch}</dt>
                <dd className="mt-1 font-medium">{formatDate(vehicle.launchDate, locale)}</dd>
              </div>
              <div>
                <dt className="text-ash">{t.vehicles.dimensions}</dt>
                <dd className="mt-1 font-medium tabular-nums">{vehicle.dimensions.length} × {vehicle.dimensions.width} × {vehicle.dimensions.height} mm</dd>
              </div>
              <div>
                <dt className="text-ash">{t.vehicles.wheelbase}</dt>
                <dd className="mt-1 font-medium tabular-nums">{vehicle.dimensions.wheelbase} mm</dd>
              </div>
              <div>
                <dt className="text-ash">{t.common.seats}</dt>
                <dd className="mt-1 font-medium">{vehicle.seats.join(" / ")}</dd>
              </div>
              {vehicle.cargoL ? (
                <div>
                  <dt className="text-ash">{t.vehicles.cargo}</dt>
                  <dd className="mt-1 font-medium tabular-nums">{vehicle.cargoL} L{vehicle.frunkL ? ` + ${vehicle.frunkL} L` : ""}</dd>
                </div>
              ) : null}
              <div>
                <dt className="text-ash">{t.common.deposit}</dt>
                <dd className="mt-1 font-medium">{formatCNY(vehicle.deposit)}</dd>
              </div>
            </dl>
          </Reveal>
        </Container>
      </section>

      {/* Trims */}
      <section id="trims" className="scroll-mt-28 bg-cloud py-20 lg:py-28">
        <Container>
          <SectionHeading eyebrow={t.vehicles.trims} title={locale === "zh" ? `${pick(vehicle.name, locale)} 全部版本` : `Every ${pick(vehicle.name, locale)}`} subtitle={t.common.officialNote} />
          <div className={`mt-12 grid gap-5 ${vehicle.trims.length >= 4 ? "md:grid-cols-2 xl:grid-cols-4" : vehicle.trims.length === 3 ? "md:grid-cols-3" : vehicle.trims.length === 2 ? "md:grid-cols-2" : ""}`}>
            {vehicle.trims.map((tr, i) => (
              <Reveal key={tr.id} delay={i * 60} className="h-full">
                <article className="flex h-full flex-col rounded-3xl bg-white p-6 hairline">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-semibold leading-snug">{pick(tr.name, locale)}</h3>
                    {tr.badge ? <Badge tone="dark">{pick(tr.badge, locale)}</Badge> : null}
                  </div>
                  <p className="mt-3 text-2xl font-semibold tabular-nums">
                    {formatPriceHeadline(tr.price, locale)}
                    {tr.priceUSD ? <span className="ml-2 text-sm font-normal text-slate">{formatUSD(tr.priceUSD)}</span> : null}
                  </p>
                  <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 border-y border-line py-4 text-sm">
                    <div>
                      <dt className="text-ash">{vehicle.powertrain === "erev" ? (locale === "zh" ? "综合 / 纯电" : "Combined / EV") : `${tr.rangeStandard}`}</dt>
                      <dd className="font-medium tabular-nums">{vehicle.powertrain === "erev" ? `${tr.rangeKm} / ${tr.evRangeKm} km` : `${tr.rangeKm} km`}</dd>
                    </div>
                    <div>
                      <dt className="text-ash">{t.common.accel}</dt>
                      <dd className="font-medium tabular-nums">{tr.accel} s</dd>
                    </div>
                    <div>
                      <dt className="text-ash">{t.common.power}</dt>
                      <dd className="font-medium tabular-nums">{tr.powerKw} kW / {tr.powerPs} PS</dd>
                    </div>
                    <div>
                      <dt className="text-ash">{t.common.topSpeed}</dt>
                      <dd className="font-medium tabular-nums">{tr.topSpeed} km/h</dd>
                    </div>
                    <div>
                      <dt className="text-ash">{t.common.battery}</dt>
                      <dd className="font-medium tabular-nums">{tr.batteryKwh} kWh · {pick(tr.batteryType, locale)}</dd>
                    </div>
                    <div>
                      <dt className="text-ash">{t.common.drivetrain}</dt>
                      <dd className="font-medium">{pick(tr.drivetrain, locale)}</dd>
                    </div>
                    {tr.peakChargeKw ? (
                      <div>
                        <dt className="text-ash">{t.common.charging}</dt>
                        <dd className="font-medium tabular-nums">{tr.peakChargeKw} kW{tr.charge10to80Min ? ` · 10-80% ${tr.charge10to80Min} min` : ""}</dd>
                      </div>
                    ) : null}
                    {tr.platformVoltage ? (
                      <div>
                        <dt className="text-ash">{locale === "zh" ? "平台电压" : "Architecture"}</dt>
                        <dd className="font-medium">{tr.platformVoltage}</dd>
                      </div>
                    ) : null}
                  </dl>
                  <ul className="mt-4 flex-1 space-y-2 text-sm text-graphite">
                    {tr.features.map((f) => (
                      <li key={f.zh} className="flex gap-2">
                        <Check className="mt-0.5 size-4 shrink-0 text-success" />
                        <span>{pick(f, locale)}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 text-xs text-ash">
                    {t.configurator.deliveryEta}: {tr.deliveryWeeks[0]}-{tr.deliveryWeeks[1]} {t.common.weeks}
                  </p>
                  {!isOverseas ? (
                    <Button href={`/vehicles/${vehicle.slug}/design?trim=${tr.id}`} className="mt-5" fullWidth>
                      {t.vehicles.designCta}
                    </Button>
                  ) : null}
                </article>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Features */}
      <section id="features" className="scroll-mt-28 py-20 lg:py-28">
        <Container>
          <SectionHeading eyebrow={t.vehicles.highlights} title={locale === "zh" ? "核心亮点" : "Highlights"} />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {vehicle.features.map((f, i) => (
              <Reveal key={f.title.zh} delay={i * 50}>
                <div className="h-full rounded-3xl bg-cloud p-6 hairline">
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-white hairline">
                    <Icon name={f.icon} className="size-5" />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold">{pick(f.title, locale)}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate">{pick(f.body, locale)}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Design */}
      <section id="design" className="scroll-mt-28 bg-cloud py-20 lg:py-28">
        <Container>
          <SectionHeading eyebrow={t.configurator.title} title={`${t.vehicles.colors} · ${t.vehicles.wheels} · ${t.vehicles.interiors}`} action={!isOverseas ? <Button href={`/vehicles/${vehicle.slug}/design`} iconRight={<ArrowRight className="size-4" />}>{t.vehicles.designCta}</Button> : undefined} />
          <div className="mt-12">
            <PaintExplorer paints={vehicle.paints} wheels={vehicle.wheels} interiors={vehicle.interiors} initialPaintId={vehicle.heroPaintId} />
          </div>
        </Container>
      </section>

      {/* Gallery */}
      <section id="gallery" className="scroll-mt-28 py-20 lg:py-28">
        <Container>
          <SectionHeading eyebrow={t.vehicles.gallery} title={pick(vehicle.name, locale)} />
          <div className="mt-12 grid gap-4 md:grid-cols-2">
            {gallery.map((img, i) => (
              <Reveal key={img.src + i} delay={(i % 2) * 60} className={i === 0 ? "md:col-span-2" : ""}>
                <figure className={`relative overflow-hidden rounded-3xl bg-mist ${i === 0 ? "aspect-[16/9] md:aspect-[21/9]" : "aspect-[16/10]"}`}>
                  <Image src={img.src} alt={pick(img.alt, locale)} fill sizes={i === 0 ? "100vw" : "(min-width: 768px) 50vw, 100vw"} className="object-cover" />
                  <figcaption className="absolute bottom-3 left-4 rounded-pill bg-black/45 px-3 py-1 text-[11px] text-white backdrop-blur">{pick(img.alt, locale)}</figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Specs */}
      <section id="specs" className="scroll-mt-28 bg-cloud py-20 lg:py-28">
        <Container>
          <SectionHeading eyebrow={t.vehicles.specs} title={locale === "zh" ? "参数配置" : "Specifications"} />
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            {vehicle.specs.map((group) => (
              <div key={group.title.zh} className="rounded-3xl bg-white p-6 hairline">
                <h3 className="text-base font-semibold">{pick(group.title, locale)}</h3>
                <dl className="mt-4 divide-y divide-line">
                  {group.rows.map((row) => (
                    <div key={row.label.zh} className="grid grid-cols-[minmax(110px,0.8fr)_1.6fr] gap-4 py-3 text-sm">
                      <dt className="text-slate">{pick(row.label, locale)}</dt>
                      <dd className="font-medium text-ink">{pick(row.value, locale)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
            <div className="rounded-3xl bg-white p-6 hairline">
              <h3 className="text-base font-semibold">{t.vehicles.warranty}</h3>
              <ul className="mt-4 space-y-2 text-sm text-graphite">
                {vehicle.warranty.map((w) => (
                  <li key={w.zh} className="flex gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-success" />
                    {pick(w, locale)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p className="mt-8 text-xs leading-5 text-ash">{t.common.officialNote}</p>
        </Container>
      </section>

      {isOverseas ? (
        <section id="interest" className="scroll-mt-28 py-20 lg:py-28">
          <Container className="max-w-3xl">
            <SectionHeading title={locale === "zh" ? `登记关注 ${pick(vehicle.name, locale)}` : `Register interest in ${pick(vehicle.name, locale)}`} subtitle={locale === "zh" ? "中国大陆暂未上市。留下联系方式，有引进与预订信息时我们会第一时间通知您。" : "Not yet available in mainland China. Leave your details and we'll notify you as soon as there is news."} />
            <div className="mt-8">
              <InterestForm vehicleSlug={vehicle.slug} vehicleName={pick(vehicle.name, locale)} />
            </div>
          </Container>
        </section>
      ) : null}

      {/* Related */}
      <section className="py-20 lg:py-28">
        <Container>
          <SectionHeading eyebrow={t.vehicles.related} title={t.nav.compare} action={<Button href={`/compare?v=${vehicle.slug}`} variant="outline" iconRight={<ArrowRight className="size-4" />}>{t.vehicles.compareCta}</Button>} />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {related.map((v) => (
              <VehicleCard key={v.slug} vehicle={v} locale={locale} compact />
            ))}
          </div>
        </Container>
      </section>
    </div>
  );
}
