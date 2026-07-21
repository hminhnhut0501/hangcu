export type PriceSummary = {
  productId: string;
  currency: string;
  amountMinor: number;
  compareAtAmountMinor: number | null;
};
