"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { LOCALE_COOKIE, type Locale } from "@/lib/locale";

export interface LanguageSwitcherProps {
  locale: Locale;
  className?: string;
}

function setLocaleCookie(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; samesite=lax`;
}

const OPTIONS: { value: Locale; label: string }[] = [
  { value: "en", label: "EN" },
  { value: "ar", label: "عربي" },
];

/**
 * Writes the locale cookie and asks the server tree to re-render — the
 * whole point is that this never navigates.
 */
function LanguageSwitcher({ locale, className }: LanguageSwitcherProps) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();

  function select(next: Locale) {
    if (next === locale) return;
    document.documentElement.classList.add("locale-transitioning");
    setLocaleCookie(next);
    startTransition(() => {
      router.refresh();
    });
  }

  React.useEffect(() => {
    if (isPending) return;
    const id = requestAnimationFrame(() => {
      document.documentElement.classList.remove("locale-transitioning");
    });
    return () => cancelAnimationFrame(id);
  }, [isPending]);

  return (
    <div
      role="radiogroup"
      aria-label="Language"
      aria-busy={isPending}
      dir="ltr"
      className={cn("inline-flex items-center gap-0.5 rounded-full bg-bg-subtle p-1", className)}
    >
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={locale === option.value}
          disabled={isPending}
          onClick={() => select(option.value)}
          className={cn(
            "t-label-sm rounded-full px-3 py-1.5 transition-colors disabled:cursor-wait",
            locale === option.value
              ? "bg-bg-surface text-fg-primary shadow-(--elev-01)"
              : "text-fg-tertiary hover:text-fg-secondary",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export { LanguageSwitcher };
