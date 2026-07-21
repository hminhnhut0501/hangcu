import { catalogProducts } from "@/lib/catalog/mock-data";
import type { PriceSummary } from "./types";

export interface PriceRepository {
  findCurrentByProductId(productId: string): Promise<PriceSummary | null>;
}

export class InMemoryPriceRepository implements PriceRepository {
  async findCurrentByProductId(productId: string): Promise<PriceSummary | null> {
    const product = catalogProducts.find((entry) => entry.id === productId);

    if (!product) {
      return null;
    }

    return {
      productId,
      currency: product.currency,
      amountMinor: product.amountMinor,
      compareAtAmountMinor: product.compareAtAmountMinor
    };
  }
}
