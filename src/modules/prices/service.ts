import { PriceNotFoundError } from "./errors";
import { InMemoryPriceRepository } from "./repository";

const priceRepository = new InMemoryPriceRepository();

export async function getCurrentPriceForProduct(productId: string) {
  const price = await priceRepository.findCurrentByProductId(productId);

  if (!price) {
    throw new PriceNotFoundError();
  }

  return price;
}
