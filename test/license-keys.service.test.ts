import { describe, expect, it } from "vitest";
import { hashLicenseKey, normalizeLicenseKeyForLookup } from "@/lib/crypto/hash";

describe("license key utilities", () => {
  it("normalizes license keys", () => {
    expect(normalizeLicenseKeyForLookup(" hc-7km4 -r2nx-p9va ")).toBe("HC7KM4R2NXP9VA");
  });

  it("hashes normalized codes consistently", () => {
    expect(hashLicenseKey("HC-7KM4-R2NX-P9VA")).toBe(hashLicenseKey("hc7km4r2nxp9va"));
  });
});
