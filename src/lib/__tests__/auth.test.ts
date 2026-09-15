import { describe, expect, it } from "vitest";
import { createSessionToken, hashPassword, normalizeIdentifier, readSessionToken, verifyPassword } from "@/lib/auth";

describe("auth primitives", () => {
  it("hashes and verifies passwords", async () => {
    const hash = await hashPassword("correct horse battery");
    expect(hash).toMatch(/^[0-9a-f]{32}:[0-9a-f]{128}$/);
    expect(await verifyPassword("correct horse battery", hash)).toBe(true);
    expect(await verifyPassword("wrong", hash)).toBe(false);
  });
  it("round-trips session tokens", async () => {
    const token = await createSessionToken("U-42");
    expect(await readSessionToken(token)).toBe("U-42");
    expect(await readSessionToken(token + "x")).toBeNull();
    expect(await readSessionToken(undefined)).toBeNull();
  });
  it("normalises identifiers", () => {
    expect(normalizeIdentifier("138 0000 0000")).toEqual({ field: "phone", value: "13800000000" });
    expect(normalizeIdentifier("Someone@Example.com")).toEqual({ field: "email", value: "someone@example.com" });
    expect(normalizeIdentifier("nope")).toBeNull();
  });
});
