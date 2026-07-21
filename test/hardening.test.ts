import { describe, expect, it } from "vitest";
import { hasMinimumAdminRole } from "@/modules/hardening/permission";
import { generateCsrfToken, verifyCsrfToken } from "@/modules/hardening/csrf";

describe("hardening helpers", () => {
  it("compares admin roles", () => {
    expect(hasMinimumAdminRole("admin", "support")).toBe(true);
    expect(hasMinimumAdminRole("viewer", "admin")).toBe(false);
  });

  it("verifies csrf tokens", () => {
    const token = generateCsrfToken();
    expect(verifyCsrfToken(token, token)).toBe(true);
    expect(verifyCsrfToken(token, `${token}x`)).toBe(false);
  });
});
