import type { ReactNode } from "react";
import { cookies } from "next/headers";
import Link from "next/link";

import { SiteHeader } from "@/components/lisaan/site-header";
import { Logo } from "@/components/lisaan/logo";
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale } from "@/lib/locale";
import { STUDENT_COOKIE } from "@/lib/session";

const LINKS = [
  { label: "Courses", href: "/#courses" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Blog", href: "/#blog" },
];

export default async function MarketingLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value;
  const locale = isLocale(cookieLocale) ? cookieLocale : DEFAULT_LOCALE;
  const signedIn = cookieStore.has(STUDENT_COOKIE);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader locale={locale} links={LINKS} signedIn={signedIn} />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-stroke-default bg-bg-inverse">
        <div className="mx-auto flex max-w-(--breakpoint-lg) flex-col gap-10 px-5 py-14 lg:px-16">
          <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
            <div className="flex flex-col gap-3">
              <Logo tone="mono" className="text-fg-on-brand" />
              <p className="t-body-sm max-w-xs text-fg-on-brand/70">
                Recorded lessons, graded practice, and one instructor — built for Arabic speakers
                learning English in the Gulf.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-2">
              <div className="flex flex-col gap-3">
                <p className="t-label-sm text-fg-on-brand/50">Product</p>
                <Link href="/#courses" className="t-body-sm text-fg-on-brand/80 hover:text-fg-on-brand">
                  Courses
                </Link>
                <Link href="/#pricing" className="t-body-sm text-fg-on-brand/80 hover:text-fg-on-brand">
                  Pricing
                </Link>
                <Link href="/#blog" className="t-body-sm text-fg-on-brand/80 hover:text-fg-on-brand">
                  Blog
                </Link>
              </div>
              <div className="flex flex-col gap-3">
                <p className="t-label-sm text-fg-on-brand/50">Account</p>
                <Link href="/sign-in" className="t-body-sm text-fg-on-brand/80 hover:text-fg-on-brand">
                  Sign in
                </Link>
                <Link href="/sign-up" className="t-body-sm text-fg-on-brand/80 hover:text-fg-on-brand">
                  Create account
                </Link>
              </div>
            </div>
          </div>
          <p className="t-body-xs text-fg-on-brand/50">
            © {new Date().getFullYear()} Lisaan. English for Arabic speakers in the Gulf.
          </p>
        </div>
      </footer>
    </div>
  );
}
