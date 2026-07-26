import { NextResponse } from "next/server";
import { getAdminSession } from "@/modules/admin-auth/server";

export async function GET() {
  const session = await getAdminSession();
  return NextResponse.json({ success: true, data: session });
}
