export type CatalogCollection = {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: "active" | "hidden" | "archived";
  sortOrder: number;
};

export type CatalogProduct = {
  id: string;
  sku: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  status: "draft" | "active" | "hidden" | "archived";
  collectionId: string | null;
  featured: boolean;
  downloadLimit: number;
  downloadExpiryDays: number;
  currency: string;
  amountMinor: number;
  compareAtAmountMinor: number | null;
  media: Array<{
    id: string;
    type: "preview" | "detail" | "lifestyle";
    storagePath: string;
    altText: string;
    sortOrder: number;
    width: number;
    height: number;
  }>;
};

export const catalogCollections: CatalogCollection[] = [
  {
    id: "col_aurora",
    name: "Aurora Series",
    slug: "aurora-series",
    description: "Soft gradients and quiet light studies.",
    status: "active",
    sortOrder: 1
  },
  {
    id: "col_minimal",
    name: "Minimal Lines",
    slug: "minimal-lines",
    description: "Calm compositions with restrained form.",
    status: "active",
    sortOrder: 2
  }
];

export const catalogProducts: CatalogProduct[] = [
  {
    id: "prd_skyline",
    sku: "ART-SKY-001",
    name: "Hang Cú Video License - 30 Days",
    slug: "skyline-after-rain",
    shortDescription: "A transitional license product placeholder for the 30-day plan.",
    description:
      "A transitional demo entry that will be replaced by Hang Cú video license product data in the next phase.",
    status: "active",
    collectionId: "col_aurora",
    featured: true,
    downloadLimit: 3,
    downloadExpiryDays: 30,
    currency: "USD",
    amountMinor: 4900,
    compareAtAmountMinor: 6900,
    media: [
      {
        id: "med_skyline_preview",
        type: "preview",
        storagePath: "products/skyline-after-rain/preview.jpg",
        altText: "Preview of Skyline After Rain",
        sortOrder: 1,
        width: 1600,
        height: 2000
      }
    ]
  },
  {
    id: "prd_calm",
    sku: "ART-LIN-002",
    name: "Hang Cú Video License - Lifetime",
    slug: "quiet-horizon",
    shortDescription: "A transitional license product placeholder for the lifetime plan.",
    description:
      "A transitional demo entry that will be replaced by Hang Cú video license product data in the next phase.",
    status: "active",
    collectionId: "col_minimal",
    featured: false,
    downloadLimit: 3,
    downloadExpiryDays: 30,
    currency: "USD",
    amountMinor: 3600,
    compareAtAmountMinor: null,
    media: [
      {
        id: "med_calm_preview",
        type: "preview",
        storagePath: "products/quiet-horizon/preview.jpg",
        altText: "Preview of Quiet Horizon",
        sortOrder: 1,
        width: 1600,
        height: 2000
      }
    ]
  }
];
