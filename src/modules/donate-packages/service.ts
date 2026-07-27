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

export async function getDonatePackageById(id: string) {
  return repository.findById(id);
}

export async function upsertDonatePackage(input: {
  id: string;
  code: string;
  name: string;
  slug: string;
  description: string;
  suggestedAmountMinor: number | null;
  currency: string | null;
  vndPrice?: number | null;
  usdPrice?: number | null;
  status: "active" | "hidden" | "archived";
}) {
  const normalizedCurrency = typeof input.currency === "string" ? input.currency.trim().toUpperCase().replace("VNĐ", "VND") : null;
  const vndAmountMinor = typeof input.vndPrice === "number" ? input.vndPrice : null;
  const usdAmountMinor = typeof input.usdPrice === "number" ? input.usdPrice : null;
  return repository.save({
    ...input,
    currency: normalizedCurrency === "VND" || normalizedCurrency === "USD" ? normalizedCurrency : input.currency,
    suggestedAmountMinor:
      typeof input.suggestedAmountMinor === "number"
        ? input.suggestedAmountMinor
        : vndAmountMinor ?? usdAmountMinor,
    vndAmountMinor,
    usdAmountMinor,
    currencyPrices: {
      VND: vndAmountMinor,
      USD: usdAmountMinor
    },
    metadata: {
      currencyPrices: {
        VND: vndAmountMinor,
        USD: usdAmountMinor
      }
    }
  });
}

export async function deleteDonatePackage(id: string) {
  return repository.delete(id);
}
