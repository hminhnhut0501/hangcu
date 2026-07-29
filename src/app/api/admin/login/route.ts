import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { encodeAdminSession } from "@/modules/admin-auth/session";
import type { AdminRole } from "@/modules/hardening/permission";

const schema = z.object({
  username: z.string().min(1),
  password: z.string().min(1)
});

function safeEquals(left: string, right: string) {
  const leftBuf = Buffer.from(left);
  const rightBuf = Buffer.from(right);
  if (leftBuf.length !== rightBuf.length) return false;
  return timingSafeEqual(leftBuf, rightBuf);
}

function getLoginRole(): AdminRole {
  const role = process.env.ADMIN_LOGIN_ROLE as AdminRole | undefined;
  if (role === "super_admin" || role === "admin" || role === "support" || role === "content_manager" || role === "viewer") {
    return role;
  }
  return "content_manager";
}

export async function POST(request: Request) {
  const payload = await request.json().catch(() => ({}));
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: "INVALID_REQUEST", message: "Request is invalid." } },
      { status: 400 }
    );
  }

  const expectedUser = process.env.ADMIN_LOGIN_USER ?? "";
  const expectedPassword = process.env.ADMIN_LOGIN_PASSWORD ?? "";
  if (!expectedUser || !expectedPassword) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "LOGIN_NOT_CONFIGURED",
          message: "Admin login is not configured."
        }
      },
      { status: 503 }
    );
  }

  if (!safeEquals(parsed.data.username, expectedUser) || !safeEquals(parsed.data.password, expectedPassword)) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INVALID_CREDENTIALS",
          message: "Sai tài khoản hoặc mật khẩu."
        }
      },
      { status: 401 }
    );
  }

  const adminId = parsed.data.username;
  const role = getLoginRole();
  let sessionToken: string;
  try {
    sessionToken = encodeAdminSession(adminId, role);
  } catch {
    return NextResponse.json(
      { success: false, error: { code: "LOGIN_NOT_CONFIGURED", message: "Admin session security is not configured." } },
      { status: 503 }
    );
  }
  const response = NextResponse.json({
    success: true,
    data: {
      adminId,
      role
    }
  });

  response.cookies.set("admin_session", sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: Math.max(900, Number(process.env.ADMIN_SESSION_TTL_SECONDS ?? 28800))
  });

  return response;
}
