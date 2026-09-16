import { describe, expect, it } from "vitest";
import { contrastRatio, palette } from "@/lib/contrast";

const AA = 4.5;

describe("readable tokens on light surfaces (WCAG AA, <24px)", () => {
  const lights = [palette.white, palette.cloud, palette.mist] as const;

  it.each([
    ["graphite body", palette.graphite],
    ["slate secondary", palette.slate],
    ["ash meta", palette.ash],
    ["ink headings", palette.ink],
    ["mi-deep labels", palette.miDeep],
    ["atelier-deep labels", palette.atelierDeep],
    ["tesla-deep labels", palette.teslaDeep],
    ["success-deep labels", palette.successDeep],
  ] as const)("%s stays ≥ 4.5:1 on white / cloud / mist", (_name, fg) => {
    for (const bg of lights) {
      expect(contrastRatio(fg, bg), `${fg} on ${bg}`).toBeGreaterThanOrEqual(AA);
    }
  });
});

describe("readable tokens on dark surfaces (WCAG AA, <24px)", () => {
  const darks = [palette.carbon, palette.ink] as const;

  it.each([
    ["fog lede", palette.fog],
    ["dusk meta", palette.dusk],
    ["white", palette.white],
  ] as const)("%s stays ≥ 4.5:1 on carbon / ink", (_name, fg) => {
    for (const bg of darks) {
      expect(contrastRatio(fg, bg), `${fg} on ${bg}`).toBeGreaterThanOrEqual(AA);
    }
  });
});

describe("hierarchy: body is clearly darker than leftover mid-greys", () => {
  it("graphite on white is stronger than the old Tesla tertiary (#5c5e62)", () => {
    expect(contrastRatio(palette.graphite, palette.white)).toBeGreaterThan(contrastRatio("#5c5e62", palette.white));
  });

  it("slate is reserved for UI, still stronger than Apple #86868b on white", () => {
    expect(contrastRatio(palette.slate, palette.white)).toBeGreaterThan(contrastRatio("#86868b", palette.white));
  });
});
