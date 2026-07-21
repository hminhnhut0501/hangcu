import { DonatePackageNotFoundError } from "./errors";
import { createDonatePackageRepository } from "./repository";

const repository = createDonatePackageRepository();

export async function listDonatePackages() {
  return repository.list();
}

export async function getDonatePackageBySlug(slug: string) {
  const pkg = await repository.findBySlug(slug);
  if (!pkg) {
    throw new DonatePackageNotFoundError();
  }
  return pkg;
}

export async function getDonatePackageByCode(code: string) {
  return repository.findByCode(code);
}

export async function upsertDonatePackage(input: {
  id: string;
  code: string;
  name: string;
  slug: string;
  description: string;
  suggestedAmountMinor: number | null;
  currency: string | null;
  status: "active" | "hidden" | "archived";
}) {
  return repository.save({
    ...input,
    metadata: {}
  });
}
