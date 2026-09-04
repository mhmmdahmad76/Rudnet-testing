"use client";

import * as React from "react";
import Link from "next/link";
import { Menu } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/locale";
import { Logo } from "@/components/lisaan/logo";
import { LanguageSwitcher } from "@/components/lisaan/language-switcher";
import { IconButton } from "@/components/lisaan/icon-button";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export interface SiteHeaderLink {
  label: string;
  href: string;
}

export interface SiteHeaderProps {
  locale: Locale;
  links: SiteHeaderLink[];
  signedIn?: boolean;
  className?: string;
}

/** Desktop shows the full nav inline; mobile collapses to a hamburger that
 * opens a sheet from the start edge. One component, responsive by CSS. */
function SiteHeader({ locale, links, signedIn, className }: SiteHeaderProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-stroke-default bg-bg-surface/95 backdrop-blur",
        className,
      )}
    >
      <div className="mx-auto flex h-16 max-w-(--breakpoint-lg) items-center justify-between gap-4 px-5 lg:px-16">
        <Link href="/" aria-label="Lisaan home">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="t-label-md text-fg-secondary hover:text-fg-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <LanguageSwitcher locale={locale} />
          <Button asChild variant={signedIn ? "primary" : "secondary"} size="sm">
            <Link href={signedIn ? "/dashboard" : "/sign-in"}>
              {signedIn ? "Dashboard" : "Sign in"}
            </Link>
          </Button>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <LanguageSwitcher locale={locale} />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <IconButton aria-label="Open menu" variant="ghost">
                <Menu aria-hidden />
              </IconButton>
            </SheetTrigger>
            <SheetContent side="start">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <nav className="mt-8 flex flex-col gap-1">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="t-label-lg rounded-lg px-3 py-2.5 text-fg-primary hover:bg-bg-hover"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-6 flex flex-col gap-2">
                <Button asChild variant={signedIn ? "primary" : "secondary"}>
                  <Link href={signedIn ? "/dashboard" : "/sign-in"}>
                    {signedIn ? "Dashboard" : "Sign in"}
                  </Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

export { SiteHeader };
