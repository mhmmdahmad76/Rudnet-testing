import type { ReactNode } from "react";
import { cookies } from "next/headers";
import Link from "next/link";
import { Bell } from "lucide-react";

import { Logo } from "@/components/lisaan/logo";
import { AppNav, type AppNavItem } from "@/components/lisaan/app-nav";
import { SiteHeader } from "@/components/lisaan/site-header";
import { AccountMenu } from "@/components/lisaan/account-menu";
import { LanguageSwitcher } from "@/components/lisaan/language-switcher";
import { IconButton } from "@/components/lisaan/icon-button";
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale } from "@/lib/locale";

const NAV: AppNavItem[] = [
  { href: "/admin", label: "Overview", icon: "overview" },
  { href: "/admin/courses", label: "Courses", icon: "courses" },
  { href: "/admin/payments", label: "Payments", icon: "billing" },
  { href: "/admin/pricing", label: "Pricing & blog", icon: "overview" },
  { href: "/admin/settings", label: "Settings", icon: "settings" },
];

/** Same structure as the student shell, different nav — everything behind
 * the admin login runs in light mode; only the access screens are dark. */
export default async function AdminDashboardLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value;
  const locale = isLocale(cookieLocale) ? cookieLocale : DEFAULT_LOCALE;

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 flex-col border-e border-stroke-default bg-bg-surface lg:flex">
        <div className="flex items-center gap-2 p-5">
          <Link href="/admin">
            <Logo />
          </Link>
          <span className="t-overline rounded-full bg-bg-subtle px-2 py-0.5 text-fg-tertiary">
            Admin
          </span>
        </div>
        <AppNav items={NAV} className="flex-1 px-3" />
        <p className="t-body-xs border-t border-stroke-default p-4 text-fg-tertiary">
          You are the only instructor. Everything a student sees, you own.
        </p>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="hidden h-16 items-center justify-end gap-2 border-b border-stroke-default bg-bg-surface px-6 lg:flex">
          <LanguageSwitcher locale={locale} />
          <IconButton aria-label="Notifications" variant="ghost">
            <Bell aria-hidden />
          </IconButton>
          <AccountMenu
            name="Owner"
            email="owner@lisaan.app"
            locale={locale}
            accountHref="/admin/settings"
            billingHref="/admin/pricing"
            signOutRedirect="/admin/sign-in"
          />
        </div>

        <div className="lg:hidden">
          <SiteHeader
            locale={locale}
            links={NAV.map(({ href, label }) => ({ href, label }))}
            trailing={
              <AccountMenu
                name="Owner"
                email="owner@lisaan.app"
                locale={locale}
                accountHref="/admin/settings"
                billingHref="/admin/pricing"
                signOutRedirect="/admin/sign-in"
              />
            }
          />
        </div>

        <main className="flex-1 bg-bg-canvas p-5 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
