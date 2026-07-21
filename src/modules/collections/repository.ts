import { getSupabaseServiceClient } from "@/lib/db/supabase-server";
import { catalogCollections } from "@/lib/catalog/mock-data";
import type { CollectionSummary } from "./types";

export interface CollectionRepository {
  list(): Promise<CollectionSummary[]>;
  findBySlug(slug: string): Promise<CollectionSummary | null>;
  upsert(collection: CollectionSummary): Promise<CollectionSummary>;
}

export class InMemoryCollectionRepository implements CollectionRepository {
  async list(): Promise<CollectionSummary[]> {
    return [...catalogCollections];
  }

  async findBySlug(slug: string): Promise<CollectionSummary | null> {
    return catalogCollections.find((collection) => collection.slug === slug) ?? null;
  }

  async upsert(collection: CollectionSummary): Promise<CollectionSummary> {
    const index = catalogCollections.findIndex((entry) => entry.id === collection.id);
    if (index >= 0) {
      catalogCollections[index] = collection;
    } else {
      catalogCollections.push(collection);
    }
    return collection;
  }
}

export class SupabaseCollectionRepository implements CollectionRepository {
  private client = getSupabaseServiceClient();

  async list(): Promise<CollectionSummary[]> {
    if (!this.client) {
      return new InMemoryCollectionRepository().list();
    }

    const { data, error } = await this.client.from("collections").select("*").order("sort_order", { ascending: true });
    if (error) throw error;
    return (data ?? []).map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description ?? "",
      status: row.status,
      sortOrder: row.sort_order
    }));
  }

  async findBySlug(slug: string): Promise<CollectionSummary | null> {
    const collections = await this.list();
    return collections.find((collection) => collection.slug === slug) ?? null;
  }

  async upsert(collection: CollectionSummary): Promise<CollectionSummary> {
    if (!this.client) {
      return new InMemoryCollectionRepository().upsert(collection);
    }

    const { error } = await this.client.from("collections").upsert({
      id: collection.id,
      name: collection.name,
      slug: collection.slug,
      description: collection.description,
      status: collection.status,
      sort_order: collection.sortOrder
    });
    if (error) throw error;
    return collection;
  }
}
