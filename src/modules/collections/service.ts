import { CollectionNotFoundError } from "./errors";
import { SupabaseCollectionRepository } from "./repository";

const collectionRepository = new SupabaseCollectionRepository();

export async function listCollections() {
  return collectionRepository.list();
}

export async function getCollectionBySlug(slug: string) {
  const collection = await collectionRepository.findBySlug(slug);

  if (!collection) {
    throw new CollectionNotFoundError();
  }

  return collection;
}

export async function upsertCollection(collection: Parameters<typeof collectionRepository.upsert>[0]) {
  return collectionRepository.upsert(collection);
}

export async function updateCollectionStatus(collectionId: string, status: "active" | "hidden" | "archived") {
  const collection = await collectionRepository.list().then((items) => items.find((item) => item.id === collectionId));
  if (!collection) {
    throw new CollectionNotFoundError();
  }

  return collectionRepository.upsert({
    ...collection,
    status
  });
}
