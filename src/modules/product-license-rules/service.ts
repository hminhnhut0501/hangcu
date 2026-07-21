import { InMemoryProductLicenseRuleRepository } from "./repository";

const repository = new InMemoryProductLicenseRuleRepository();

export async function listLicenseRulesByProductId(productId: string) {
  return repository.listByProductId(productId);
}

export async function getLicenseRuleByProductId(productId: string) {
  return repository.findByProductId(productId);
}
