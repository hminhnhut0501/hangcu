export type SupporterPackage = {
  slug: string;
  nameVi: string;
  nameEn: string;
  descriptionVi: string;
  descriptionEn: string;
  amountMinor: number;
  currency: "VND" | "USD";
  featured?: boolean;
  badgeVi?: string;
  badgeEn?: string;
};

export const supporterPackages: SupporterPackage[] = [
  {
    slug: "supporter-basic",
    nameVi: "Gói ủng hộ cơ bản",
    nameEn: "Basic support package",
    descriptionVi: "Dành cho khách muốn ủng hộ dự án với mức nhỏ gọn, thanh toán một lần.",
    descriptionEn: "A small one-time support package for customers who want to support the project.",
    amountMinor: 990000,
    currency: "VND",
    badgeVi: "Phổ biến",
    badgeEn: "Popular",
    featured: true
  },
  {
    slug: "supporter-plus",
    nameVi: "Gói ủng hộ nâng cao",
    nameEn: "Plus support package",
    descriptionVi: "Gói cân bằng giữa mức đóng góp và lợi ích hỗ trợ cho người dùng thường xuyên.",
    descriptionEn: "Balanced support for regular users who want a better contribution tier.",
    amountMinor: 1990000,
    currency: "VND"
  },
  {
    slug: "supporter-pro",
    nameVi: "Gói ủng hộ trọn đời",
    nameEn: "Lifetime support package",
    descriptionVi: "Dành cho người muốn ủng hộ lâu dài, ưu tiên mức đóng góp cao hơn.",
    descriptionEn: "A lifetime-tier support package for long-term supporters.",
    amountMinor: 4990000,
    currency: "VND",
    badgeVi: "Trọn đời",
    badgeEn: "Lifetime"
  }
];

export function getSupporterPackageBySlug(slug: string) {
  return supporterPackages.find((item) => item.slug === slug) ?? null;
}
