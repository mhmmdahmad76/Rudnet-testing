import type { ReactNode } from "react";
import { cookies } from "next/headers";

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
      <footer className="border-t border-stroke-default bg-bg-surface">
        <div className="mx-auto flex max-w-(--breakpoint-lg) flex-col gap-4 px-5 py-10 lg:px-16">
          <Logo />
          <p className="t-body-sm text-fg-tertiary">
            © {new Date().getFullYear()} Lisaan. English for Arabic speakers in the Gulf.
          </p>
        </div>
      </footer>
    </div>
  );
}
