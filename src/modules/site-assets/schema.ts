import { z } from "zod";

export const siteAssetSchema = z.object({
  id: z.string(),
  assetKey: z.string(),
  category: z.enum(["hero", "logo", "banner", "favicon", "misc"]),
  storagePath: z.string(),
  publicUrl: z.string().nullable(),
  altTextVi: z.string().nullable(),
  altTextEn: z.string().nullable(),
  mimeType: z.string().nullable(),
  width: z.number().nullable(),
  height: z.number().nullable(),
  sortOrder: z.number().int(),
  isActive: z.boolean(),
  updatedAt: z.string()
});
