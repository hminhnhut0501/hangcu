export type ProductLicenseRuleSummary = {
  id: string;
  productId: string;
  licensePlanId: string;
  quantity: number;
  isActive: boolean;
  startsAt: Date | null;
  endsAt: Date | null;
};
