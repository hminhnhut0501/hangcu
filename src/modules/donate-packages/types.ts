export type DonatePackageSummary = {
  id: string;
  code: string;
  name: string;
  slug: string;
  description: string;
  suggestedAmountMinor: number | null;
  currency: string | null;
  status: "active" | "hidden" | "archived";
  metadata: Record<string, unknown>;
};
