import { describe, expect, it } from "vitest";
import { buildOrderDraftFromProducts } from "@/modules/orders/service";
import type { ProductSummary } from "@/modules/products/types";

const product: ProductSummary = {
  id: "prd_1",
  sku: "ART-001",
  name: "Sample Art",
  slug: "sample-art",
  shortDescription: "Short description",
  description: "Long description",
  status: "active",
  collectionId: null,
  featured: false,
  downloadLimit: 3,
  downloadExpiryDays: 30,
  currency: "USD",
  amountMinor: 5000,
  compareAtAmountMinor: null,
  media: []
};

describe("orders service", () => {
  it("builds an order draft from products", () => {
    const draft = buildOrderDraftFromProducts({
      customerEmail: "buyer@example.com",
      source: "storefront_checkout",
      products: [product]
    });

    expect(draft.items).toHaveLength(1);
    expect(draft.currency).toBe("USD");
    expect(draft.items[0].totalAmountMinor).toBe(5000);
  });
});
