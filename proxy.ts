import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, isValidSession } from "@/lib/auth";

/**
 * Password protection is optional: it only applies when APP_PASSWORD is set.
 * Without it the app is open to anyone who has the URL.
 */
export async function proxy(request: NextRequest) {
  if (!process.env.APP_PASSWORD) return NextResponse.next();
  if (await isValidSession(request.cookies.get(SESSION_COOKIE)?.value)) {
    return NextResponse.next();
  }
  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  return NextResponse.redirect(new URL("/welcome", request.url));
}

export const config = {
  matcher: [
    // Everything except public assets, the welcome page, auth API and the cron
    // endpoint (which authenticates with CRON_SECRET instead).
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js|icon|apple-icon|welcome|login|api/auth|api/cron).*)",
  ],
};
