import { NextResponse } from "next/server";
import { generateCsrfToken } from "@/modules/hardening/csrf";

export async function GET() {
  const token = generateCsrfToken();
  const response = NextResponse.json({ success: true, data: { token } });
  response.cookies.set("admin_csrf", token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/"
  });
  return response;
}
