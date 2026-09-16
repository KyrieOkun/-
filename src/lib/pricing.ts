import type { ExtraOption, InteriorOption, PaintOption, Trim, VehicleSelection, WheelOption, ClientVehicle } from "@/data/types";

export interface Quote {
  trim: Trim;
  paint: PaintOption;
  wheel: WheelOption;
  interior: InteriorOption;
  extras: ExtraOption[];
  vehiclePrice: number;
  paintPrice: number;
  wheelPrice: number;
  interiorPrice: number;
  extrasPrice: number;
  optionsTotal: number;
  subtotal: number;
  purchaseTax: number;
  total: number;
  deposit: number;
  monthly: number;
  rangeKm: number;
  deliveryWeeks: [number, number];
}

const VAT_RATE = 0.13;
const PURCHASE_TAX_RATE = 0.1;
const NEV_TAX_REDUCTION_CAP = 15_000;

/**
 * 2026–2027 NEV purchase tax: 10% of the ex-VAT price, halved, with the
 * reduction capped at ¥15,000 per vehicle.
 */
export function estimatePurchaseTax(price: number): number {
  const base = (price / (1 + VAT_RATE)) * PURCHASE_TAX_RATE;
  const reduction = Math.min(base * 0.5, NEV_TAX_REDUCTION_CAP);
  return Math.round(base - reduction);
}

export function estimateMonthly(total: number, options: { downRatio?: number; months?: number; apr?: number } = {}): number {
  const { downRatio = 0.2, months = 60, apr = 0.0299 } = options;
  const principal = total * (1 - downRatio);
  const r = apr / 12;
  if (r === 0) return Math.round(principal / months);
  const payment = (principal * r) / (1 - Math.pow(1 + r, -months));
  return Math.round(payment);
}

export function isAvailableForTrim(option: { trims?: string[] }, trimId: string): boolean {
  return !option.trims || option.trims.includes(trimId);
}

export function isIncludedInTrim(option: { includedIn?: string[] }, trimId: string): boolean {
  return Boolean(option.includedIn?.includes(trimId));
}

export function availablePaints(vehicle: ClientVehicle, trimId: string): PaintOption[] {
  return vehicle.paints.filter((p) => isAvailableForTrim(p, trimId));
}

export function availableWheels(vehicle: ClientVehicle, trimId: string): WheelOption[] {
  return vehicle.wheels.filter((w) => isAvailableForTrim(w, trimId));
}

export function availableInteriors(vehicle: ClientVehicle, trimId: string): InteriorOption[] {
  return vehicle.interiors.filter((i) => isAvailableForTrim(i, trimId));
}

export function availableExtras(vehicle: ClientVehicle, trimId: string): ExtraOption[] {
  return vehicle.extras.filter((e) => isAvailableForTrim(e, trimId));
}

export function defaultSelection(vehicle: ClientVehicle, trimId?: string): VehicleSelection {
  const trim = vehicle.trims.find((t) => t.id === trimId) ?? vehicle.trims[0];
  const paints = availablePaints(vehicle, trim.id);
  const wheels = availableWheels(vehicle, trim.id);
  const interiors = availableInteriors(vehicle, trim.id);
  return {
    trimId: trim.id,
    paintId: (paints.find((p) => p.id === vehicle.heroPaintId) ?? paints.find((p) => p.price === 0) ?? paints[0]).id,
    wheelId: (wheels.find((w) => w.price === 0) ?? wheels[0]).id,
    interiorId: (interiors.find((i) => i.price === 0) ?? interiors[0]).id,
    extraIds: [],
  };
}

/** Coerces a possibly-invalid selection (e.g. after a trim change) into a valid one. */
export function normalizeSelection(vehicle: ClientVehicle, selection: Partial<VehicleSelection>): VehicleSelection {
  const trim = vehicle.trims.find((t) => t.id === selection.trimId) ?? vehicle.trims[0];
  const base = defaultSelection(vehicle, trim.id);
  const paints = availablePaints(vehicle, trim.id);
  const wheels = availableWheels(vehicle, trim.id);
  const interiors = availableInteriors(vehicle, trim.id);
  const extras = availableExtras(vehicle, trim.id);
  return {
    trimId: trim.id,
    paintId: paints.some((p) => p.id === selection.paintId) ? (selection.paintId as string) : base.paintId,
    wheelId: wheels.some((w) => w.id === selection.wheelId) ? (selection.wheelId as string) : base.wheelId,
    interiorId: interiors.some((i) => i.id === selection.interiorId) ? (selection.interiorId as string) : base.interiorId,
    extraIds: (selection.extraIds ?? []).filter((id) => extras.some((e) => e.id === id && !isIncludedInTrim(e, trim.id))),
  };
}

export function computeQuote(vehicle: ClientVehicle, rawSelection: Partial<VehicleSelection>): Quote {
  const selection = normalizeSelection(vehicle, rawSelection);
  const trim = vehicle.trims.find((t) => t.id === selection.trimId) ?? vehicle.trims[0];
  const paint = vehicle.paints.find((p) => p.id === selection.paintId) ?? vehicle.paints[0];
  const wheel = vehicle.wheels.find((w) => w.id === selection.wheelId) ?? vehicle.wheels[0];
  const interior = vehicle.interiors.find((i) => i.id === selection.interiorId) ?? vehicle.interiors[0];
  const extras = vehicle.extras.filter((e) => selection.extraIds.includes(e.id));

  const extrasPrice = extras.reduce((sum, e) => sum + (isIncludedInTrim(e, trim.id) ? 0 : e.price), 0);
  const optionsTotal = paint.price + wheel.price + interior.price + extrasPrice;
  const subtotal = trim.price + optionsTotal;
  const purchaseTax = vehicle.availability === "overseas" ? 0 : estimatePurchaseTax(subtotal);
  const total = subtotal + purchaseTax;
  const rangeKm = Math.max(0, (trim.evRangeKm ?? trim.rangeKm) + (wheel.rangeDeltaKm ?? 0));

  return {
    trim,
    paint,
    wheel,
    interior,
    extras,
    vehiclePrice: trim.price,
    paintPrice: paint.price,
    wheelPrice: wheel.price,
    interiorPrice: interior.price,
    extrasPrice,
    optionsTotal,
    subtotal,
    purchaseTax,
    total,
    deposit: vehicle.deposit,
    monthly: estimateMonthly(subtotal),
    rangeKm,
    deliveryWeeks: trim.deliveryWeeks,
  };
}

export function encodeSelection(selection: VehicleSelection): string {
  const params = new URLSearchParams();
  params.set("trim", selection.trimId);
  params.set("paint", selection.paintId);
  params.set("wheel", selection.wheelId);
  params.set("interior", selection.interiorId);
  if (selection.extraIds.length) params.set("extras", selection.extraIds.join(","));
  return params.toString();
}

export function decodeSelection(params: URLSearchParams | Record<string, string | string[] | undefined>): Partial<VehicleSelection> {
  const get = (key: string): string | undefined => {
    if (params instanceof URLSearchParams) return params.get(key) ?? undefined;
    const v = params[key];
    return Array.isArray(v) ? v[0] : v;
  };
  const extras = get("extras");
  return {
    trimId: get("trim"),
    paintId: get("paint"),
    wheelId: get("wheel"),
    interiorId: get("interior"),
    extraIds: extras ? extras.split(",").filter(Boolean) : [],
  };
}
