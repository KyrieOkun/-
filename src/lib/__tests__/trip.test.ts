import { describe, expect, it } from "vitest";
import { planTrip } from "@/lib/trip";

describe("planTrip", () => {
  it("plans Beijing → Shanghai for an SU7 Pro with at least one charging stop", () => {
    const plan = planTrip({ originId: "beijing", destinationId: "shanghai", vehicleSlug: "xiaomi-su7", trimId: "pro", startSoc: 90, minArrivalSoc: 15, network: "any" });
    expect(plan.ok).toBe(true);
    if (!plan.ok) return;
    expect(plan.distanceKm).toBeGreaterThan(1_100);
    expect(plan.stops.length).toBeGreaterThanOrEqual(1);
    expect(plan.arrivalSoc).toBeGreaterThanOrEqual(15);
    expect(plan.totalMinutes).toBe(plan.driveMinutes + plan.chargeMinutes);
    for (const stop of plan.stops) {
      expect(stop.departSoc).toBeGreaterThan(stop.arrivalSoc);
      expect(stop.arrivalSoc).toBeGreaterThanOrEqual(5);
      expect(stop.chargeMinutes).toBeGreaterThan(0);
    }
  });

  it("needs no stops for a short hop", () => {
    const plan = planTrip({ originId: "beijing", destinationId: "tianjin", vehicleSlug: "tesla-model-y", trimId: "lr-rwd", startSoc: 80, minArrivalSoc: 10, network: "any" });
    expect(plan.ok).toBe(true);
    if (!plan.ok) return;
    expect(plan.stops).toHaveLength(0);
    expect(plan.arrivalSoc).toBeGreaterThan(50);
  });

  it("rejects identical origin and destination", () => {
    const plan = planTrip({ originId: "beijing", destinationId: "beijing", vehicleSlug: "xiaomi-su7", startSoc: 90, minArrivalSoc: 15, network: "any" });
    expect(plan.ok).toBe(false);
    if (plan.ok) return;
    expect(plan.code).toBe("SAME_CITY");
  });

  it("lets the range extender cover long EREV trips without stops", () => {
    const plan = planTrip({ originId: "beijing", destinationId: "guangzhou", vehicleSlug: "xiaomi-n90", trimId: "max", startSoc: 100, minArrivalSoc: 10, network: "any" });
    expect(plan.ok).toBe(true);
    if (!plan.ok) return;
    expect(plan.stops).toHaveLength(0);
    expect(plan.fuelLitres).toBeGreaterThan(0);
  });

  it("applies a winter penalty", () => {
    const mild = planTrip({ originId: "shanghai", destinationId: "hangzhou", vehicleSlug: "tesla-model-3", trimId: "lr-rwd", startSoc: 80, minArrivalSoc: 10, network: "any", season: "mild" });
    const winter = planTrip({ originId: "shanghai", destinationId: "hangzhou", vehicleSlug: "tesla-model-3", trimId: "lr-rwd", startSoc: 80, minArrivalSoc: 10, network: "any", season: "winter" });
    expect(mild.ok && winter.ok).toBe(true);
    if (!mild.ok || !winter.ok) return;
    expect(winter.arrivalSoc).toBeLessThan(mild.arrivalSoc);
  });
});
