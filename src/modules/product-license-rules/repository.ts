import { productLicenseRulesSeed } from "@/lib/license/mock-data";
import type { ProductLicenseRuleSummary } from "./types";

const rules: ProductLicenseRuleSummary[] = [...productLicenseRulesSeed];

export interface ProductLicenseRuleRepository {
  listByProductId(productId: string): Promise<ProductLicenseRuleSummary[]>;
  findByProductId(productId: string): Promise<ProductLicenseRuleSummary | null>;
}

export class InMemoryProductLicenseRuleRepository implements ProductLicenseRuleRepository {
  async listByProductId(productId: string): Promise<ProductLicenseRuleSummary[]> {
    return rules.filter((rule) => rule.productId === productId && rule.isActive);
  }

  async findByProductId(productId: string): Promise<ProductLicenseRuleSummary | null> {
    return (await this.listByProductId(productId))[0] ?? null;
  }
}
