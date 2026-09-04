import Link from "next/link";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export interface CourseCardProps {
  href: string;
  title: string;
  level: string;
  meta: string;
  progress?: number;
  className?: string;
}

/** The whole card is a link. Hover and focus only — links do not depress. */
function CourseCard({ href, title, level, meta, progress, className }: CourseCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex flex-col overflow-hidden rounded-xl border border-stroke-default bg-bg-surface outline-none transition-shadow",
        "hover:shadow-(--elev-02) focus-visible:shadow-(--elev-focus)",
        className,
      )}
    >
      <div className="relative aspect-video bg-gradient-to-br from-bg-brand to-bg-inverse">
        <Badge
          tone="brand"
          dot={false}
          className="absolute start-3 top-3 bg-bg-surface/90 text-fg-brand"
        >
          {level}
        </Badge>
      </div>
      <div className="flex flex-col gap-2 p-4">
        <p className="t-h6 text-fg-primary">{title}</p>
        <p className="t-body-xs text-fg-tertiary">{meta}</p>
        {typeof progress === "number" && <Progress value={progress} size="xs" />}
      </div>
    </Link>
  );
}

export { CourseCard };
