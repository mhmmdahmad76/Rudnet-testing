import { NextResponse, type NextRequest } from "next/server";

import {
  ADMIN_2FA_COOKIE,
  ADMIN_SESSION_COOKIE,
  ONBOARDING_STEPS,
  ONBOARDING_STEP_COOKIE,
  SESSION_COOKIE,
  VERIFIED_COOKIE,
  type OnboardingStep,
} from "@/lib/session";

const STUDENT_PROTECTED_PREFIXES = ["/devices", "/onboarding", "/dashboard", "/courses"];
const ADMIN_ACCESS_PATHS = ["/admin/sign-in", "/admin/2fa", "/admin/invite", "/admin/locked"];

/**
 * Mirrors BUILD.md §8's middleware rules. There is no backend, so "signed
 * in" / "verified" / "onboarded" are demo cookies rather than real
 * sessions — see lib/session.ts.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (ADMIN_ACCESS_PATHS.some((path) => pathname.startsWith(path))) {
      return NextResponse.next();
    }
    if (!request.cookies.has(ADMIN_SESSION_COOKIE)) {
      return NextResponse.redirect(new URL("/admin/sign-in", request.url));
    }
    if (!request.cookies.has(ADMIN_2FA_COOKIE)) {
      return NextResponse.redirect(new URL("/admin/2fa", request.url));
    }
    return NextResponse.next();
  }

  const isProtected = STUDENT_PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (!isProtected) return NextResponse.next();

  if (!request.cookies.has(SESSION_COOKIE)) {
    const url = new URL("/sign-in", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (request.cookies.get(VERIFIED_COOKIE)?.value !== "1") {
    return NextResponse.redirect(new URL("/verify-email", request.url));
  }

  if (!pathname.startsWith("/onboarding")) {
    const step = request.cookies.get(ONBOARDING_STEP_COOKIE)?.value;
    if (step !== "done") {
      const target = ONBOARDING_STEPS.includes(step as OnboardingStep)
        ? (step as OnboardingStep)
        : ONBOARDING_STEPS[0];
      return NextResponse.redirect(new URL(`/onboarding/${target}`, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/courses/:path*",
    "/devices",
    "/onboarding/:path*",
    "/admin/:path*",
  ],
};
