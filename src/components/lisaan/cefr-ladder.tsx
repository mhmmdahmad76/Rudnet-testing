import Link from "next/link";

import { cn } from "@/lib/utils";

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
export type CefrLevel = (typeof LEVELS)[number];

export interface CefrLadderProps {
  current: CefrLevel;
  hrefFor?: (level: CefrLevel) => string;
  className?: string;
}

/** Each chip is a filter link. Levels above the student's own are muted. */
function CefrLadder({ current, hrefFor, className }: CefrLadderProps) {
  const currentIndex = LEVELS.indexOf(current);

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      {LEVELS.map((level, index) => {
        const isCurrent = level === current;
        const isAbove = index > currentIndex;
        return (
          <Link
            key={level}
            href={hrefFor ? hrefFor(level) : `?level=${level}`}
            className={cn(
              "t-label-sm flex size-8 items-center justify-center rounded-full border transition-colors outline-none focus-visible:shadow-(--elev-focus)",
              isCurrent
                ? "border-stroke-brand bg-bg-brand text-fg-on-brand"
                : isAbove
                  ? "border-stroke-subtle text-fg-disabled hover:bg-bg-hover"
                  : "border-stroke-default text-fg-secondary hover:bg-bg-hover",
            )}
          >
            {level}
          </Link>
        );
      })}
    </div>
  );
}

export { CefrLadder, LEVELS };
