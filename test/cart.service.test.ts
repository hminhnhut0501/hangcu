import { describe, expect, it } from "vitest";
import { createCartSnapshot, getCartItemCount } from "@/modules/cart/service";

describe("cart service", () => {
  it("counts cart items", () => {
    expect(
      getCartItemCount([
        { productId: "a", quantity: 1 },
        { productId: "b", quantity: 2 }
      ])
    ).toBe(3);
  });

  it("creates a validated cart snapshot", () => {
    expect(
      createCartSnapshot([{ productId: "p_1", quantity: 1 }]).items
    ).toHaveLength(1);
  });
});
