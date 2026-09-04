"use client";

import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { NavItem } from "@/components/lisaan/nav-item";

export interface AppNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

/** Highlights the item matching the current route. */
function AppNav({ items, className }: { items: AppNavItem[]; className?: string }) {
  const pathname = usePathname();
  return (
    <nav className={cn("flex flex-col gap-1", className)}>
      {items.map((item) => (
        <NavItem
          key={item.href}
          href={item.href}
          icon={item.icon}
          label={item.label}
          selected={pathname === item.href || pathname.startsWith(`${item.href}/`)}
        />
      ))}
    </nav>
  );
}

export { AppNav };
