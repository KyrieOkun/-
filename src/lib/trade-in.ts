import { z } from "zod";

export const tradeInSchema = z.object({
  brand: z.string().trim().min(1).max(30),
  model: z.string().trim().min(1).max(60),
  year: z.number().int().min(2010).max(2026),
  mileageKm: z.number().int().min(0).max(600_000),
  condition: z.enum(["excellent", "good", "fair"]),
  originalPrice: z.number().min(30_000).max(5_000_000),
  city: z.string().trim().max(40).optional(),
  targetBrand: z.enum(["xiaomi", "tesla"]).optional(),
  isEv: z.boolean().default(true),
});

export type TradeInInput = z.infer<typeof tradeInSchema>;

export interface TradeInEstimate {
  low: number;
  high: number;
  mid: number;
  subsidy: number;
  crossBrand: boolean;
  totalCredit: number;
  validUntil: string;
  breakdown: { ageYears: number; ageFactor: number; mileageFactor: number; conditionFactor: number; marketFactor: number };
}

const CONDITION: Record<TradeInInput["condition"], number> = { excellent: 1.04, good: 1, fair: 0.9 };
const CROSS_BRAND_BONUS = 12_000;
const SAME_BRAND_BONUS = 8_000;

/**
 * Residual-value model calibrated to 2026 mainland-China used-EV market data:
 * steep first-year depreciation, ~9%/yr thereafter, mileage-adjusted against a
 * 15,000 km/yr baseline, floor at 12% of original price.
 */
export function estimateTradeIn(input: TradeInInput, now = new Date()): TradeInEstimate {
  const ageYears = Math.max(0, now.getFullYear() - input.year + (now.getMonth() >= 6 ? 0.5 : 0));
  const ageFactor = ageYears <= 0 ? 0.86 : ageYears < 1 ? 0.78 : 0.78 * Math.pow(0.91, ageYears - 1);
  const expectedKm = Math.max(1, ageYears) * 15_000;
  const mileageDelta = (input.mileageKm - expectedKm) / 10_000;
  const mileageFactor = Math.min(1.06, Math.max(0.78, 1 - mileageDelta * 0.025));
  const conditionFactor = CONDITION[input.condition];
  const brand = input.brand.toLowerCase();
  const marketFactor = brand.includes("tesla") || brand.includes("特斯拉") ? 1.05 : brand.includes("xiaomi") || brand.includes("小米") ? 1.08 : input.isEv ? 0.96 : 0.9;

  const mid = Math.round((input.originalPrice * Math.max(0.12, ageFactor * mileageFactor * conditionFactor * marketFactor)) / 100) * 100;
  const low = Math.round((mid * 0.94) / 100) * 100;
  const high = Math.round((mid * 1.05) / 100) * 100;
  const sourceIsXiaomi = brand.includes("xiaomi") || brand.includes("小米");
  const sourceIsTesla = brand.includes("tesla") || brand.includes("特斯拉");
  const crossBrand = Boolean(input.targetBrand && ((input.targetBrand === "xiaomi" && sourceIsTesla) || (input.targetBrand === "tesla" && sourceIsXiaomi)));
  const subsidy = input.targetBrand ? (crossBrand ? CROSS_BRAND_BONUS : SAME_BRAND_BONUS) : 0;
  const validUntil = new Date(now.getTime() + 7 * 86_400_000).toISOString();

  return {
    low,
    high,
    mid,
    subsidy,
    crossBrand,
    totalCredit: mid + subsidy,
    validUntil,
    breakdown: { ageYears, ageFactor: round(ageFactor), mileageFactor: round(mileageFactor), conditionFactor, marketFactor },
  };
}

function round(v: number): number {
  return Math.round(v * 1000) / 1000;
}
