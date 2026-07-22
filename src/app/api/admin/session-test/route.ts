import { NextResponse } from "next/server";
import { z } from "zod";
import { encodeAdminSession } from "@/modules/admin-auth/session";
import type { AdminRole } from "@/modules/hardening/permission";

const schema = z.object({
  adminId: z.string().min(1).default("admin_local"),
  role: z.enum(["super_admin", "admin", "support", "content_manager", "viewer"]).default("content_manager")
});

export async function POST(request: Request) {
  const payload = await request.json().catch(() => ({}));
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: "INVALID_REQUEST", message: "Request is invalid." } },
      { status: 400 }
    );
  }

  const response = NextResponse.json({
    success: true,
    data: {
      adminId: parsed.data.adminId,
      role: parsed.data.role
    }
  });

  response.cookies.set("admin_session", encodeAdminSession(parsed.data.adminId, parsed.data.role), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/"
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set("admin_session", "", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
  });
  return response;
}
