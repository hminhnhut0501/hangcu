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
    bucketName: string;
    storagePath: string;
    publicUrl: string | null;
    altText: string;
    sortOrder: number;
    width: number;
    height: number;
  }>;
};

export const catalogCollections: CatalogCollection[] = [
  {
    id: "col_aurora",
    name: "License Plans",
    slug: "aurora-series",
    description: "Time-based and lifetime license plans.",
    status: "active",
    sortOrder: 1
  },
  {
    id: "col_minimal",
    name: "Bonus Packages",
    slug: "minimal-lines",
    description: "Donate packages with bonus license keys.",
    status: "active",
    sortOrder: 2
  }
];

export const catalogProducts: CatalogProduct[] = [
  {
    id: "prd_skyline",
    sku: "HCV-LIC-30",
    name: "Hang Cú video - License 30 days",
    slug: "skyline-after-rain",
    shortDescription: "One-month access license for Hang Cú video.",
    description: "Best for short-term users who want to activate the software for 30 days.",
    status: "active",
    collectionId: "col_aurora",
    featured: true,
    downloadLimit: 1,
    downloadExpiryDays: 30,
    currency: "USD",
    amountMinor: 9900,
    compareAtAmountMinor: 12900,
    media: [
      {
        id: "med_skyline_preview",
        type: "preview",
        bucketName: "product-media",
        storagePath: "products/hangcu-license-30/preview.jpg",
        publicUrl: null,
        altText: "Hang Cú video license 30 days preview",
        sortOrder: 1,
        width: 1600,
        height: 2000
      }
    ]
  },
  {
    id: "prd_calm",
    sku: "HCV-LIC-LIFE",
    name: "Hang Cú video - Lifetime license",
    slug: "quiet-horizon",
    shortDescription: "Permanent access license for Hang Cú video.",
    description: "Best for long-term users who want a one-time payment and lifetime activation.",
    status: "active",
    collectionId: "col_minimal",
    featured: false,
    downloadLimit: 1,
    downloadExpiryDays: 36500,
    currency: "USD",
    amountMinor: 29900,
    compareAtAmountMinor: 39900,
    media: [
      {
        id: "med_calm_preview",
        type: "preview",
        bucketName: "product-media",
        storagePath: "products/hangcu-license-lifetime/preview.jpg",
        publicUrl: null,
        altText: "Hang Cú video lifetime license preview",
        sortOrder: 1,
        width: 1600,
        height: 2000
      }
    ]
  }
];
