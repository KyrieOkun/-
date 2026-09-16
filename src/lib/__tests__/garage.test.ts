import { describe, expect, it } from "vitest";
import { applyCommand, computeStatus, generateDemoVin, isValidVin, type GarageVehicle } from "@/lib/garage";

const gv: GarageVehicle = {
  id: "GV-1",
  ownerId: "U-1",
  vehicleSlug: "xiaomi-su7",
  trimId: "max",
  vin: "HXMABC1234567890K",
  nickname: "Test",
  createdAt: "2026-09-15T00:00:00.000Z",
  state: { locked: true, climateOn: false, targetTemp: 22, charging: false, pluggedIn: false, sentry: true },
};

describe("garage telemetry", () => {
  it("is deterministic for the same VIN and time", () => {
    const now = Date.parse("2026-09-15T10:00:00Z");
    expect(computeStatus(gv, now)).toEqual(computeStatus(gv, now));
  });
  it("reports range consistent with battery", () => {
    const s = computeStatus(gv, Date.parse("2026-09-15T10:00:00Z"));
    expect(s.batteryPercent).toBeGreaterThan(0);
    expect(s.rangeKm).toBeLessThanOrEqual(835);
    expect(s.tyrePressureBar).toHaveLength(4);
  });
  it("applies commands", () => {
    const unlocked = applyCommand(gv, "unlock");
    expect(unlocked.state.locked).toBe(false);
    const charging = applyCommand(unlocked, "charge_start");
    expect(charging.state.charging).toBe(true);
    expect(charging.state.pluggedIn).toBe(true);
    const warm = applyCommand(charging, "set_temp", { temp: 26 });
    expect(warm.state.targetTemp).toBe(26);
    expect(warm.state.climateOn).toBe(true);
    expect(computeStatus(warm).charging).toBe(true);
  });
  it("validates and generates VINs", () => {
    expect(isValidVin("HXMABC1234567890K")).toBe(true);
    expect(isValidVin("IOQ00000000000000")).toBe(false);
    expect(isValidVin(generateDemoVin("tesla", "seed"))).toBe(true);
    expect(generateDemoVin("tesla", "seed").startsWith("LRW")).toBe(true);
  });
});
