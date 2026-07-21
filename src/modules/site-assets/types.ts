export type SiteAsset = {
  id: string;
  assetKey: string;
  category: "hero" | "logo" | "banner" | "favicon" | "misc";
  storagePath: string;
  publicUrl: string | null;
  altTextVi: string | null;
  altTextEn: string | null;
  mimeType: string | null;
  width: number | null;
  height: number | null;
  sortOrder: number;
  isActive: boolean;
  updatedAt: string;
};
