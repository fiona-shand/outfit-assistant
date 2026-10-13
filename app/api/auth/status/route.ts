import { NextResponse } from "next/server";

/** Tells the welcome page whether a password is required. */
export async function GET() {
  return NextResponse.json({ password_required: !!process.env.APP_PASSWORD });
}
