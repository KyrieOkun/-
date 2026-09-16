import { describe, expect, it } from "vitest";
import { zh } from "@/lib/i18n/dictionaries/zh";
import { en } from "@/lib/i18n/dictionaries/en";
import { getDictionary, pick } from "@/lib/i18n";

function flatten(obj: Record<string, unknown>, prefix = ""): Record<string, string> {
  return Object.entries(obj).reduce<Record<string, string>>((acc, [k, v]) => {
    const key = prefix ? `${prefix}.${k}` : k;
    if (typeof v === "string") acc[key] = v;
    else Object.assign(acc, flatten(v as Record<string, unknown>, key));
    return acc;
  }, {});
}

describe("dictionaries", () => {
  const zhFlat = flatten(zh as unknown as Record<string, unknown>);
  const enFlat = flatten(en as unknown as Record<string, unknown>);

  it("have identical key sets", () => {
    expect(Object.keys(enFlat).sort()).toEqual(Object.keys(zhFlat).sort());
  });
  it("have no empty strings", () => {
    for (const [k, v] of Object.entries({ ...zhFlat, ...enFlat })) {
      expect(v.trim().length, k).toBeGreaterThan(0);
    }
  });
  it("resolve through getDictionary and pick", () => {
    expect(getDictionary("en").nav.vehicles).toBe("Vehicles");
    expect(getDictionary("zh").nav.vehicles).toBe("车型");
    expect(pick({ zh: "你好", en: "Hello" }, "en")).toBe("Hello");
    expect(pick("plain", "zh")).toBe("plain");
  });
});
