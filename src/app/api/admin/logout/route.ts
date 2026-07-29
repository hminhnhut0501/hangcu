import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true });
  for (const name of ["admin_session", "admin_csrf"]) {
    response.cookies.set(name, "", {
      httpOnly: name === "admin_session",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0,
      expires: new Date(0)
    });
  }
  return response;
}

export const DELETE = POST;
