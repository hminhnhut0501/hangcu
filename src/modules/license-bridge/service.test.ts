import { describe, expect, it } from "vitest";
import { resolveCheckoutPlanCode } from "./service";

describe("resolveCheckoutPlanCode", () => {
  it("maps legacy bot codes to current DB plan codes", () => {
    expect(resolveCheckoutPlanCode("HCV_30D")).toBe("FULL_1M");
    expect(resolveCheckoutPlanCode("HCV_LIFETIME")).toBe("FULL_LIFE");
    expect(resolveCheckoutPlanCode("HCV-LIC-30")).toBe("FULL_1M");
    expect(resolveCheckoutPlanCode("HCV-LIC-LIFE")).toBe("FULL_LIFE");
  });

  it("keeps current plan codes intact", () => {
    expect(resolveCheckoutPlanCode("FULL_1M")).toBe("FULL_1M");
    expect(resolveCheckoutPlanCode("FULL_LIFE")).toBe("FULL_LIFE");
  });
});
