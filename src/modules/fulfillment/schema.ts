import { z } from "zod";

export const fulfillmentResultSchema = z.object({
  orderId: z.string(),
  orderNumber: z.string(),
  downloadToken: z.string(),
  issuedLicenseKeys: z.array(z.string()),
  status: z.enum(["fulfilled", "partially_fulfilled", "processing"])
});

export type FulfillmentResult = z.infer<typeof fulfillmentResultSchema>;
