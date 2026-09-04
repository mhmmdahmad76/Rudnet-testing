import type { ReactNode } from "react";
import { cookies } from "next/headers";
import Link from "next/link";
import { Bell } from "lucide-react";

import { Logo } from "@/components/lisaan/logo";
import { AppNav, type AppNavItem } from "@/components/lisaan/app-nav";
import { AppSearch } from "@/components/lisaan/app-search";
import { SiteHeader } from "@/components/lisaan/site-header";
import { AccountMenu } from "@/components/lisaan/account-menu";
import { LanguageSwitcher } from "@/components/lisaan/language-switcher";
import { IconButton } from "@/components/lisaan/icon-button";
import { Avatar } from "@/components/ui/avatar";
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale } from "@/lib/locale";
import { EMAIL_COOKIE, NAME_COOKIE } from "@/lib/session";

const NAV: AppNavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: "home" },
  { href: "/courses", label: "My courses", icon: "courses" },
  { href: "/resources", label: "Resources", icon: "resources" },
  { href: "/quizzes", label: "Quizzes", icon: "quizzes" },
  { href: "/certificates", label: "Certificates", icon: "certificates" },
  { href: "/billing", label: "Billing", icon: "billing" },
];

export default async function AppLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value;
  const locale = isLocale(cookieLocale) ? cookieLocale : DEFAULT_LOCALE;
  const name = cookieStore.get(NAME_COOKIE)?.value ?? "Student";
  const email = cookieStore.get(EMAIL_COOKIE)?.value ?? "student@example.com";

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 flex-col border-e border-stroke-default bg-bg-surface lg:flex">
        <div className="p-5">
          <Link href="/dashboard">
            <Logo />
          </Link>
        </div>
        <AppNav items={NAV} className="flex-1 px-3" />
        <div className="flex items-center gap-3 border-t border-stroke-default p-4">
          <Avatar name={name} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="t-body-sm-strong truncate text-fg-primary">{name}</p>
            <p className="t-body-xs truncate text-fg-tertiary">{email}</p>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="hidden h-16 items-center gap-4 border-b border-stroke-default bg-bg-surface px-6 lg:flex">
          <AppSearch />
          <div className="ms-auto flex items-center gap-2">
            <LanguageSwitcher locale={locale} />
            <IconButton aria-label="Notifications" variant="ghost">
              <Bell aria-hidden />
            </IconButton>
            <AccountMenu name={name} email={email} locale={locale} />
          </div>
        </div>

        <div className="lg:hidden">
          <SiteHeader
            locale={locale}
            links={NAV.map(({ href, label }) => ({ href, label }))}
            trailing={<AccountMenu name={name} email={email} locale={locale} />}
          />
        </div>

        <main className="flex-1 bg-bg-canvas p-5 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
