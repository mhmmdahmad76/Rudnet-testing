import type { ReactNode } from "react";
import { cookies } from "next/headers";
import Link from "next/link";

import { Logo } from "@/components/lisaan/logo";
import { LanguageSwitcher } from "@/components/lisaan/language-switcher";
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale } from "@/lib/locale";

/**
 * The 4-segment step bar is rendered per-page (via OnboardingStepBar) so it
 * can be deleted, not hidden, on the post-checkout screens — it isn't part
 * of this shared shell.
 */
export default async function OnboardingLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value;
  const locale = isLocale(cookieLocale) ? cookieLocale : DEFAULT_LOCALE;

  return (
    <div className="flex min-h-screen flex-col bg-bg-canvas">
      <div className="flex items-center justify-between p-5 lg:px-16">
        <Link href="/">
          <Logo />
        </Link>
        <LanguageSwitcher locale={locale} />
      </div>
      <div className="flex flex-1 items-start justify-center p-5 pb-16">
        <div className="w-full max-w-xl">{children}</div>
      </div>
    </div>
  );
}
