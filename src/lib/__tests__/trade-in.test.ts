import { describe, expect, it } from "vitest";
import { estimateTradeIn } from "@/lib/trade-in";

const base = { brand: "特斯拉 Tesla", model: "Model 3", year: 2022, mileageKm: 45_000, condition: "good" as const, originalPrice: 279_900, isEv: true };
const now = new Date("2026-09-15");

describe("estimateTradeIn", () => {
  it("returns a plausible range", () => {
    const e = estimateTradeIn(base, now);
    expect(e.low).toBeLessThan(e.mid);
    expect(e.mid).toBeLessThan(e.high);
    expect(e.mid).toBeGreaterThan(80_000);
    expect(e.mid).toBeLessThan(200_000);
  });
  it("grants the cross-brand bonus for Tesla → Xiaomi", () => {
    const e = estimateTradeIn({ ...base, targetBrand: "xiaomi" }, now);
    expect(e.crossBrand).toBe(true);
    expect(e.subsidy).toBe(12_000);
    expect(e.totalCredit).toBe(e.mid + 12_000);
  });
  it("grants the same-brand bonus for Tesla → Tesla", () => {
    const e = estimateTradeIn({ ...base, targetBrand: "tesla" }, now);
    expect(e.crossBrand).toBe(false);
    expect(e.subsidy).toBe(8_000);
  });
  it("grants no bonus when trading in a third-party brand", () => {
    const e = estimateTradeIn({ ...base, brand: "比亚迪 BYD", targetBrand: "xiaomi" }, now);
    expect(e.crossBrand).toBe(false);
    expect(e.subsidy).toBe(0);
    expect(e.totalCredit).toBe(e.mid);
  });
  it("values newer, lower-mileage cars higher", () => {
    const older = estimateTradeIn({ ...base, year: 2020, mileageKm: 120_000 }, now);
    const newer = estimateTradeIn({ ...base, year: 2025, mileageKm: 8_000 }, now);
    expect(newer.mid).toBeGreaterThan(older.mid);
  });
});
