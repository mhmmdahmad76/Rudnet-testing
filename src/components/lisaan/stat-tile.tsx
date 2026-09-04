import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { IconChip, type IconChipProps } from "@/components/lisaan/icon-chip";

export interface StatTileProps {
  icon: LucideIcon;
  tone: NonNullable<IconChipProps["tone"]>;
  /** t-display-lg by default, t-numeric-lg when this is money. */
  value: string;
  label: string;
  delta?: string;
  href?: string;
  numeric?: boolean;
  className?: string;
}

function StatTile({ icon, tone, value, label, delta, href, numeric, className }: StatTileProps) {
  const content = (
    <>
      <IconChip icon={icon} tone={tone} size="md" />
      <div className="flex flex-col gap-1">
        <p className={numeric ? "t-numeric-lg text-fg-primary" : "t-display-lg text-fg-primary"}>
          {value}
        </p>
        <p className="t-body-sm text-fg-tertiary">{label}</p>
        {delta && <p className="t-body-xs text-fg-success">{delta}</p>}
      </div>
    </>
  );

  const classes = cn(
    "flex items-start gap-3 rounded-xl border border-stroke-default bg-bg-surface p-4 outline-none transition-shadow",
    href && "hover:shadow-(--elev-02) focus-visible:shadow-(--elev-focus)",
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return <div className={classes}>{content}</div>;
}

export { StatTile };
