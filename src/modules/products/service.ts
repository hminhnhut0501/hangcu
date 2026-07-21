import { ProductNotFoundError } from "./errors";
import { SupabaseProductRepository } from "./repository";

const productRepository = new SupabaseProductRepository();

export async function listProducts() {
  return productRepository.list();
}

export async function listFeaturedProducts() {
  return productRepository.listFeatured();
}

export async function listProductsByCollectionSlug(slug: string) {
  return productRepository.listByCollectionSlug(slug);
}

export async function getProductBySlug(slug: string) {
  const product = await productRepository.findBySlug(slug);

  if (!product) {
    throw new ProductNotFoundError();
  }

  return product;
}

export async function upsertProduct(product: Parameters<typeof productRepository.upsert>[0]) {
  return productRepository.upsert(product);
}

export async function updateProductStatus(productId: string, status: "draft" | "active" | "hidden" | "archived") {
  const product = await productRepository.list().then((items) => items.find((item) => item.id === productId));
  if (!product) {
    throw new ProductNotFoundError();
  }

  return productRepository.upsert({
    ...product,
    status
  });
}
