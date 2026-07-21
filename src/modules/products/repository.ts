import { getSupabaseServiceClient } from "@/lib/db/supabase-server";
import { catalogProducts } from "@/lib/catalog/mock-data";
import type { ProductSummary } from "./types";

export interface ProductRepository {
  list(): Promise<ProductSummary[]>;
  findBySlug(slug: string): Promise<ProductSummary | null>;
  listFeatured(): Promise<ProductSummary[]>;
  listByCollectionSlug(slug: string): Promise<ProductSummary[]>;
  upsert(product: ProductSummary): Promise<ProductSummary>;
}

export class InMemoryProductRepository implements ProductRepository {
  async list(): Promise<ProductSummary[]> {
    return [...catalogProducts];
  }

  async findBySlug(slug: string): Promise<ProductSummary | null> {
    return catalogProducts.find((product) => product.slug === slug) ?? null;
  }

  async listFeatured(): Promise<ProductSummary[]> {
    return catalogProducts.filter((product) => product.featured);
  }

  async listByCollectionSlug(slug: string): Promise<ProductSummary[]> {
    const collectionId = slug === "aurora-series" ? "col_aurora" : slug === "minimal-lines" ? "col_minimal" : null;

    if (!collectionId) {
      return [];
    }

    return catalogProducts.filter((product) => product.collectionId === collectionId);
  }

  async upsert(product: ProductSummary): Promise<ProductSummary> {
    const index = catalogProducts.findIndex((entry) => entry.id === product.id);
    if (index >= 0) {
      catalogProducts[index] = product;
    } else {
      catalogProducts.push(product);
    }
    return product;
  }
}

export class SupabaseProductRepository implements ProductRepository {
  private client = getSupabaseServiceClient();

  async list(): Promise<ProductSummary[]> {
    if (!this.client) {
      return new InMemoryProductRepository().list();
    }

    const { data, error } = await this.client.from("products").select("*, product_media(*)").order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row) => ({
      id: row.id,
      sku: row.sku,
      name: row.name,
      slug: row.slug,
      shortDescription: row.short_description ?? "",
      description: row.description ?? "",
      status: row.status,
      collectionId: row.collection_id ?? null,
      featured: row.featured,
      downloadLimit: row.download_limit,
      downloadExpiryDays: row.download_expiry_days,
      currency: "USD",
      amountMinor: 0,
      compareAtAmountMinor: null,
      media: []
    }));
  }

  async findBySlug(slug: string): Promise<ProductSummary | null> {
    const products = await this.list();
    return products.find((product) => product.slug === slug) ?? null;
  }

  async listFeatured(): Promise<ProductSummary[]> {
    return (await this.list()).filter((product) => product.featured);
  }

  async listByCollectionSlug(slug: string): Promise<ProductSummary[]> {
    return (await this.list()).filter((product) => {
      if (slug === "aurora-series") return product.collectionId === "col_aurora";
      if (slug === "minimal-lines") return product.collectionId === "col_minimal";
      return false;
    });
  }

  async upsert(product: ProductSummary): Promise<ProductSummary> {
    if (!this.client) {
      return new InMemoryProductRepository().upsert(product);
    }

    const { error } = await this.client.from("products").upsert({
      id: product.id,
      sku: product.sku,
      name: product.name,
      slug: product.slug,
      short_description: product.shortDescription,
      description: product.description,
      status: product.status,
      collection_id: product.collectionId,
      featured: product.featured,
      download_limit: product.downloadLimit,
      download_expiry_days: product.downloadExpiryDays,
      metadata: {},
      published_at: null
    });
    if (error) throw error;
    return product;
  }
}
