import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export interface NavItemProps {
  href: string;
  icon: LucideIcon;
  label: string;
  selected?: boolean;
  className?: string;
}

function NavItem({ href, icon: Icon, label, selected, className }: NavItemProps) {
  return (
    <Link
      href={href}
      aria-current={selected ? "page" : undefined}
      className={cn(
        "t-label-md flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 outline-none transition-colors focus-visible:shadow-(--elev-focus)",
        selected
          ? "bg-bg-selected text-fg-brand"
          : "text-fg-secondary hover:bg-bg-hover hover:text-fg-primary",
        className,
      )}
    >
      <Icon className="size-5 shrink-0" aria-hidden />
      {label}
    </Link>
  );
}

export { NavItem };
