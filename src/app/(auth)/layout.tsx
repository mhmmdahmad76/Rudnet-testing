import type { ReactNode } from "react";
import { cookies } from "next/headers";
import Link from "next/link";

import { Logo } from "@/components/lisaan/logo";
import { LanguageSwitcher } from "@/components/lisaan/language-switcher";
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale } from "@/lib/locale";

const QUOTES = [
  {
    quote:
      "I finally understood the difference between “since” and “for” — three months of confusion, gone in one lesson.",
    name: "Yousef, B1",
  },
  {
    quote: "The quizzes made me actually remember the grammar instead of just recognizing it.",
    name: "Rania, C1",
  },
];

/**
 * Every auth screen shares this two-pane layout: a violet-to-ink gradient
 * brand panel on the leading side, form card on the trailing side. The
 * brand panel is dropped entirely below 1024.
 */
export default async function AuthLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value;
  const locale = isLocale(cookieLocale) ? cookieLocale : DEFAULT_LOCALE;
  const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];

  return (
    <div className="flex min-h-screen">
      <div className="hidden flex-1 flex-col justify-between bg-gradient-to-br from-bg-brand to-bg-inverse p-12 lg:flex">
        <Link href="/" className="text-fg-on-brand">
          <Logo tone="mono" />
        </Link>
        <blockquote className="flex flex-col gap-3 text-fg-on-brand">
          <p className="t-h3">&ldquo;{quote.quote}&rdquo;</p>
          <cite className="t-body-sm text-fg-on-brand/70 not-italic">— {quote.name}</cite>
        </blockquote>
      </div>

      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-between p-5 lg:justify-end lg:p-8">
          <Link href="/" className="lg:hidden">
            <Logo />
          </Link>
          <LanguageSwitcher locale={locale} />
        </div>
        <div className="flex flex-1 items-center justify-center p-5 pb-16">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
    </div>
  );
}
