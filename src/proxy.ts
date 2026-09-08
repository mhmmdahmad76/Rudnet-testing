import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

import {
  ADMIN_COOKIE,
  STUDENT_COOKIE,
  type AdminClaims,
  type StudentClaims,
} from "@/lib/session-cookies";

const STUDENT_PROTECTED_PREFIXES = ["/devices", "/onboarding", "/dashboard", "/courses", "/placement-test"];
const ADMIN_ACCESS_PATHS = ["/admin/sign-in", "/admin/2fa", "/admin/invite", "/admin/locked"];

const secretKey = process.env.SESSION_SECRET;
const encodedKey = secretKey ? new TextEncoder().encode(secretKey) : null;

/**
 * Optimistic checks only — decrypts the signed session cookie and redirects
 * based on its claims, with no database call. This is Next.js's own
 * recommended shape for Proxy/middleware auth: fast on every request
 * (including prefetches), but not the security boundary. The database is
 * re-checked on every protected page/action via lib/dal.ts, so a session
 * revoked server-side (sign-out elsewhere, a suspension) takes effect
 * immediately even though the JWT itself would still verify.
 */
async function decrypt<T>(token: string | undefined): Promise<T | null> {
  if (!token || !encodedKey) return null;
  try {
    const { payload } = await jwtVerify(token, encodedKey, { algorithms: ["HS256"] });
    return payload as unknown as T;
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (ADMIN_ACCESS_PATHS.some((path) => pathname.startsWith(path))) {
      return NextResponse.next();
    }
    const claims = await decrypt<AdminClaims>(request.cookies.get(ADMIN_COOKIE)?.value);
    if (!claims) {
      return NextResponse.redirect(new URL("/admin/sign-in", request.url));
    }
    if (!claims.twoFactorVerified) {
      return NextResponse.redirect(new URL("/admin/2fa", request.url));
    }
    return NextResponse.next();
  }

  const isProtected = STUDENT_PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (!isProtected) return NextResponse.next();

  const claims = await decrypt<StudentClaims>(request.cookies.get(STUDENT_COOKIE)?.value);
  if (!claims) {
    const url = new URL("/sign-in", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (!claims.emailVerified) {
    return NextResponse.redirect(new URL("/verify-email", request.url));
  }

  if (!pathname.startsWith("/onboarding") && claims.onboardingStep !== "done") {
    return NextResponse.redirect(new URL(`/onboarding/${claims.onboardingStep}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/courses/:path*",
    "/devices",
    "/onboarding/:path*",
    "/placement-test",
    "/admin/:path*",
  ],
};
