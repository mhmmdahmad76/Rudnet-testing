"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CreditCard, LogOut, User } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LanguageSwitcher } from "@/components/lisaan/language-switcher";
import type { Locale } from "@/lib/locale";
import {
  ONBOARDING_STEP_COOKIE,
  SESSION_COOKIE,
  VERIFIED_COOKIE,
  clearDemoCookie,
} from "@/lib/session";

export interface AccountMenuProps {
  name: string;
  email: string;
  locale: Locale;
  accountHref?: string;
  billingHref?: string;
  signOutRedirect?: string;
}

/** Avatar click → Account · Billing · Language · Sign out. */
function AccountMenu({
  name,
  email,
  locale,
  accountHref = "/account",
  billingHref = "/billing",
  signOutRedirect = "/",
}: AccountMenuProps) {
  const router = useRouter();

  function signOut() {
    clearDemoCookie(SESSION_COOKIE);
    clearDemoCookie(VERIFIED_COOKIE);
    clearDemoCookie(ONBOARDING_STEP_COOKIE);
    router.push(signOutRedirect);
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="rounded-full outline-none focus-visible:shadow-(--elev-focus)">
        <Avatar name={name} size="sm" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span className="t-body-sm-strong text-fg-primary">{name}</span>
            <span className="t-body-xs text-fg-tertiary">{email}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={accountHref}>
            <User className="size-4" aria-hidden /> Account
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={billingHref}>
            <CreditCard className="size-4" aria-hidden /> Billing
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <div className="flex items-center justify-between px-2 py-1.5">
          <span className="t-body-sm text-fg-secondary">Language</span>
          <LanguageSwitcher locale={locale} />
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="danger" onClick={signOut}>
          <LogOut className="size-4" aria-hidden /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { AccountMenu };
