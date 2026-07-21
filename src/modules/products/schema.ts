import { z } from "zod";

export const productStatusSchema = z.enum(["draft", "active", "hidden", "archived"]);
export const mediaTypeSchema = z.enum(["preview", "detail", "lifestyle"]);

export const productMediaSchema = z.object({
  id: z.string(),
  type: mediaTypeSchema,
  bucketName: z.string(),
  storagePath: z.string(),
  publicUrl: z.string().nullable(),
  altText: z.string(),
  sortOrder: z.number().int().nonnegative(),
  width: z.number().int().positive(),
  height: z.number().int().positive()
});

export const productSchema = z.object({
  id: z.string(),
  sku: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
  shortDescription: z.string(),
  description: z.string(),
  status: productStatusSchema,
  collectionId: z.string().nullable(),
  featured: z.boolean(),
  downloadLimit: z.number().int().positive(),
  downloadExpiryDays: z.number().int().positive(),
  currency: z.string().min(3).max(3),
  amountMinor: z.number().int().nonnegative(),
  compareAtAmountMinor: z.number().int().nonnegative().nullable(),
  media: z.array(productMediaSchema)
});

export type Product = z.infer<typeof productSchema>;
export type ProductMedia = z.infer<typeof productMediaSchema>;
