import { z } from "zod";
import { requireAdminMutationAccess } from "@/modules/admin-auth/guard";
import { isStorageBucketMissingError, uploadStorageFile } from "@/lib/storage/service";

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
  try {
    const uploaded = await uploadStorageFile({ path, file });
    return Response.json({ success: true, data: uploaded });
  } catch (error) {
    if (isStorageBucketMissingError(error)) {
      return Response.json(
        {
          success: false,
          error: {
            code: "STORAGE_BUCKET_MISSING",
            message: "Thiếu bucket Supabase Storage cho upload. Hãy chạy migration tạo bucket hoặc cấu hình SUPABASE_STORAGE_BUCKET đúng tên bucket."
          }
        },
        { status: 503 }
      );
    }

    throw error;
  }
}
