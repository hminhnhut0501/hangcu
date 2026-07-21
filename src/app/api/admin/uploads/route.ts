import { z } from "zod";
import { requireAdminMutationAccess } from "@/modules/admin-auth/guard";
import { uploadStorageFile } from "@/lib/storage/service";

const schema = z.object({
  folder: z.string().min(1),
  assetKey: z.string().min(1)
});

export async function POST(request: Request) {
  await requireAdminMutationAccess("content_manager");

  const formData = await request.formData();
  const file = formData.get("file");
  const folder = formData.get("folder");
  const assetKey = formData.get("assetKey");

  const parsed = schema.safeParse({
    folder: typeof folder === "string" ? folder : "",
    assetKey: typeof assetKey === "string" ? assetKey : ""
  });

  if (!parsed.success || !(file instanceof File)) {
    return Response.json({ success: false, error: { code: "INVALID_REQUEST", message: "Request is invalid." } }, { status: 400 });
  }

  const extension = file.name.split(".").pop() || "bin";
  const path = `${parsed.data.folder}/${parsed.data.assetKey}.${extension}`;
  const uploaded = await uploadStorageFile({ path, file });

  return Response.json({ success: true, data: uploaded });
}
