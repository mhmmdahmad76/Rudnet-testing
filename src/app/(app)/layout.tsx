import type { ReactNode } from "react";
import { cookies } from "next/headers";
import Link from "next/link";
import { Bell, Sparkles } from "lucide-react";

import { Logo } from "@/components/lisaan/logo";
import { AppNav, type AppNavItem } from "@/components/lisaan/app-nav";
import { AppSearch } from "@/components/lisaan/app-search";
import { SiteHeader } from "@/components/lisaan/site-header";
import { AccountMenu } from "@/components/lisaan/account-menu";
import { IconButton } from "@/components/lisaan/icon-button";
import { Button } from "@/components/ui/button";
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale } from "@/lib/locale";
import { getDictionary } from "@/lib/i18n";
import { verifyStudentSession } from "@/lib/dal";
import { signOutStudent } from "@/app/(auth)/actions";

function navFor(t: ReturnType<typeof getDictionary>): AppNavItem[] {
  return [
    { href: "/dashboard", label: t.nav.dashboard, icon: "home" },
    { href: "/courses", label: t.nav.courses, icon: "courses" },
    { href: "/resources", label: t.nav.resources, icon: "resources" },
    { href: "/quizzes", label: t.nav.quizzes, icon: "quizzes" },
    { href: "/certificates", label: t.nav.certificates, icon: "certificates" },
    { href: "/billing", label: t.nav.billing, icon: "billing" },
  ];
}

export default async function AppLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value;
  const locale = isLocale(cookieLocale) ? cookieLocale : DEFAULT_LOCALE;
  const t = getDictionary(locale);
  const NAV = navFor(t);
  const session = await verifyStudentSession();
  const { name, email, planStatus } = session;

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 flex-col border-e border-stroke-default bg-bg-surface lg:flex">
        <div className="p-5">
          <Link href="/dashboard">
            <Logo />
          </Link>
        </div>
        <AppNav items={NAV} className="flex-1 px-3" />
        {planStatus === "free" && (
          <div className="mx-3 mb-3 flex flex-col gap-2 rounded-xl bg-gradient-to-br from-bg-brand-subtle to-bg-accent-subtle p-4">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-fg-brand" aria-hidden />
              <p className="t-label-md text-fg-brand">{t.premiumBanner.title}</p>
            </div>
            <p className="t-body-xs text-fg-secondary">{t.premiumBanner.body}</p>
            <Button asChild size="sm" className="mt-1">
              <Link href="/onboarding/plan">{t.premiumBanner.cta}</Link>
            </Button>
          </div>
        )}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="hidden h-16 items-center gap-4 border-b border-stroke-default bg-bg-surface px-6 lg:flex">
          <AppSearch locale={locale} />
          <div className="ms-auto flex items-center gap-2">
            <IconButton aria-label={t.notifications} variant="ghost">
              <Bell aria-hidden />
            </IconButton>
            <AccountMenu name={name} email={email} locale={locale} signOutAction={signOutStudent} />
          </div>
        </div>

        <div className="lg:hidden">
          <SiteHeader
            locale={locale}
            links={NAV.map(({ href, label }) => ({ href, label }))}
            trailing={<AccountMenu name={name} email={email} locale={locale} signOutAction={signOutStudent} />}
            showLanguageSwitcher={false}
          />
        </div>

        <main className="flex-1 bg-bg-canvas p-5 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
