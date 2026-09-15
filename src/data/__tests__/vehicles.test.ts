import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { vehicles } from "@/data/vehicles";
import { availableInteriors, availablePaints, availableWheels } from "@/lib/pricing";
import { stations } from "@/data/charging";
import { cityById } from "@/data/cities";
import { articles } from "@/data/news";
import { stores } from "@/data/site";

const PUBLIC = path.resolve(__dirname, "../../../public");

describe("vehicle catalogue integrity", () => {
  it("has unique slugs and non-empty trims", () => {
    const slugs = vehicles.map((v) => v.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const v of vehicles) expect(v.trims.length, v.slug).toBeGreaterThan(0);
  });

  it("has unique option ids and valid trim references", () => {
    for (const v of vehicles) {
      const trimIds = new Set(v.trims.map((t) => t.id));
      expect(trimIds.size).toBe(v.trims.length);
      for (const group of [v.paints, v.wheels, v.interiors, v.extras] as const) {
        const ids = group.map((o) => o.id);
        expect(new Set(ids).size, `${v.slug} option ids`).toBe(ids.length);
        for (const o of group) {
          for (const t of o.trims ?? []) expect(trimIds.has(t), `${v.slug}/${o.id} → trim ${t}`).toBe(true);
        }
      }
      for (const e of v.extras) for (const t of e.includedIn ?? []) expect(trimIds.has(t), `${v.slug}/${e.id} includedIn ${t}`).toBe(true);
    }
  });

  it("offers at least one paint, wheel and interior for every trim", () => {
    for (const v of vehicles) {
      for (const t of v.trims) {
        expect(availablePaints(v, t.id).length, `${v.slug}/${t.id} paints`).toBeGreaterThan(0);
        expect(availableWheels(v, t.id).length, `${v.slug}/${t.id} wheels`).toBeGreaterThan(0);
        expect(availableInteriors(v, t.id).length, `${v.slug}/${t.id} interiors`).toBeGreaterThan(0);
      }
    }
  });

  it("has sane numeric specs", () => {
    for (const v of vehicles) {
      for (const t of v.trims) {
        expect(t.price, `${v.slug}/${t.id}`).toBeGreaterThan(100_000);
        expect(t.rangeKm).toBeGreaterThan(300);
        expect(t.accel).toBeGreaterThan(1.5);
        expect(t.accel).toBeLessThan(8);
        expect(t.powerKw).toBeGreaterThan(100);
        expect(t.batteryKwh).toBeGreaterThan(50);
        expect(t.deliveryWeeks[0]).toBeLessThanOrEqual(t.deliveryWeeks[1]);
      }
      expect(v.highlights.length).toBe(4);
      expect(v.features.length).toBe(6);
      expect(v.specs.length).toBeGreaterThan(0);
      expect(v.warranty.length).toBeGreaterThan(0);
    }
  });

  it("ships every referenced image", () => {
    for (const v of vehicles) {
      for (const img of [v.hero, ...v.images]) {
        expect(existsSync(path.join(PUBLIC, img.src)), img.src).toBe(true);
      }
      for (const opt of [...v.paints, ...v.wheels, ...v.interiors]) {
        if (opt.image) expect(existsSync(path.join(PUBLIC, opt.image)), opt.image).toBe(true);
      }
      if (v.heroPaintId) expect(v.paints.some((p) => p.id === v.heroPaintId), `${v.slug} heroPaintId`).toBe(true);
    }
    for (const a of articles) expect(existsSync(path.join(PUBLIC, a.image)), a.image).toBe(true);
  });

  it("backs every Xiaomi paint with an official photograph", () => {
    for (const v of vehicles.filter((x) => x.brand === "xiaomi" && x.slug !== "xiaomi-su7-ultra")) {
      for (const p of v.paints) expect(p.image, `${v.slug}/${p.id}`).toBeTruthy();
    }
  });

  it("has bilingual copy everywhere", () => {
    for (const v of vehicles) {
      expect(v.name.zh && v.name.en).toBeTruthy();
      expect(v.description.zh.length).toBeGreaterThan(40);
      expect(v.description.en.length).toBeGreaterThan(40);
    }
  });
});

describe("network & content data", () => {
  it("places every station and store in a known city", () => {
    for (const s of stations) expect(cityById[s.cityId], s.id).toBeDefined();
    for (const s of stores) expect(cityById[s.cityId], s.id).toBeDefined();
  });
  it("has unique station ids", () => {
    const ids = stations.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it("links related articles to real slugs", () => {
    const slugs = new Set(articles.map((a) => a.slug));
    for (const a of articles) for (const r of a.related ?? []) expect(slugs.has(r), `${a.slug} → ${r}`).toBe(true);
  });
});
