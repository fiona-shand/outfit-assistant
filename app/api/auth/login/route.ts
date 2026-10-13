import { NextResponse } from "next/server";
import { SESSION_COOKIE, sessionToken } from "@/lib/auth";
import { HttpError, route } from "@/lib/http";

export const POST = route(async (req: Request) => {
  const { password } = await req.json();
  const expected = process.env.APP_PASSWORD;
  if (!expected) throw new HttpError(500, "APP_PASSWORD is not set on the server");
  if (typeof password !== "string" || password !== expected) {
    await new Promise((r) => setTimeout(r, 800));
    throw new HttpError(401, "Wrong password");
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, await sessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return res;
});
