import { describe, expect, it } from "vitest";
import { computeQuote, decodeSelection, defaultSelection, encodeSelection, estimateMonthly, estimatePurchaseTax, normalizeSelection } from "@/lib/pricing";
import { getVehicle } from "@/data/vehicles";

describe("estimatePurchaseTax (2026–2027 NEV rules)", () => {
  it("halves the 10% ex-VAT tax below the cap", () => {
    // 219,900 / 1.13 × 10% = 19,460 → halved = 9,730
    expect(estimatePurchaseTax(219_900)).toBe(9_730);
  });
  it("caps the reduction at ¥15,000", () => {
    // 529,900 / 1.13 × 10% = 46,894 → reduction capped at 15,000 → 31,894
    expect(estimatePurchaseTax(529_900)).toBe(31_894);
  });
  it("is monotonic", () => {
    expect(estimatePurchaseTax(300_000)).toBeGreaterThan(estimatePurchaseTax(250_000));
  });
});

describe("estimateMonthly", () => {
  it("computes an annuity payment", () => {
    const m = estimateMonthly(300_000, { downRatio: 0.2, months: 60, apr: 0.0299 });
    expect(m).toBeGreaterThan(4_000);
    expect(m).toBeLessThan(4_500);
  });
  it("handles zero APR", () => {
    expect(estimateMonthly(120_000, { downRatio: 0, months: 12, apr: 0 })).toBe(10_000);
  });
});

describe("computeQuote", () => {
  const su7 = getVehicle("xiaomi-su7")!;

  it("uses free defaults for the base trim", () => {
    const q = computeQuote(su7, defaultSelection(su7));
    expect(q.trim.id).toBe("standard");
    expect(q.optionsTotal).toBe(0);
    expect(q.subtotal).toBe(219_900);
    expect(q.total).toBe(219_900 + estimatePurchaseTax(219_900));
    expect(q.deposit).toBe(5_000);
  });

  it("adds paint, wheel, interior and extra prices", () => {
    const q = computeQuote(su7, { trimId: "max", paintId: "capri-blue", wheelId: "21-forged-plum", interiorId: "capri-special", extraIds: ["fridge"] });
    expect(q.vehiclePrice).toBe(303_900);
    expect(q.optionsTotal).toBe(7_000 + 18_000 + 4_000 + 2_000);
    expect(q.rangeKm).toBe(835 - 45);
  });

  it("does not charge for extras included in the trim", () => {
    const q = computeQuote(su7, { trimId: "max", extraIds: ["nappa", "audio-25"] });
    expect(q.extrasPrice).toBe(0);
  });

  it("drops options unavailable for the chosen trim", () => {
    const sel = normalizeSelection(su7, { trimId: "standard", wheelId: "21-forged-plum", interiorId: "capri-special" });
    expect(sel.wheelId).toBe("19-diamond");
    expect(sel.interiorId).toBe("night-black");
  });

  it("skips purchase tax for overseas-only vehicles", () => {
    const cyber = getVehicle("tesla-cybertruck")!;
    const q = computeQuote(cyber, defaultSelection(cyber));
    expect(q.purchaseTax).toBe(0);
  });

  it("round-trips selections through the URL codec", () => {
    const sel = { trimId: "pro", paintId: "chixia-red", wheelId: "20-blade", interiorId: "sand-beige", extraIds: ["fridge", "spoiler"] };
    const decoded = decodeSelection(new URLSearchParams(encodeSelection(sel)));
    expect(normalizeSelection(su7, decoded)).toEqual(sel);
  });
});
