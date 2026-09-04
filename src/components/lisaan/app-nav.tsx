"use client";

import { usePathname } from "next/navigation";
import {
  Award,
  BarChart3,
  BookOpen,
  CreditCard,
  Folder,
  Home,
  Settings,
  Target,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { NavItem } from "@/components/lisaan/nav-item";

/**
 * Server layouts build the nav list, but a Lucide icon component isn't a
 * plain serializable value — it can't cross the server → client boundary as
 * a prop. Icons are looked up here by key instead.
 */
const ICONS: Record<string, LucideIcon> = {
  home: Home,
  courses: BookOpen,
  resources: Folder,
  quizzes: Target,
  certificates: Award,
  billing: CreditCard,
  overview: BarChart3,
  settings: Settings,
};

export interface AppNavItem {
  href: string;
  label: string;
  icon: keyof typeof ICONS;
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
          icon={ICONS[item.icon]}
          label={item.label}
          selected={pathname === item.href || pathname.startsWith(`${item.href}/`)}
        />
      ))}
    </nav>
  );
}

export { AppNav };
