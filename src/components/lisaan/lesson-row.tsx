import Link from "next/link";
import { CheckCircle2, Lock, PlayCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export interface LessonRowProps {
  status: "complete" | "current" | "locked";
  title: string;
  kind: "Video" | "Reading" | "Quiz";
  duration: string;
  href?: string;
  /** What unlocks it — shown in a tooltip since locked rows are not links. */
  lockedReason?: string;
  className?: string;
}

function LessonRow({ status, title, kind, duration, href, lockedReason, className }: LessonRowProps) {
  const icon =
    status === "complete" ? (
      <CheckCircle2 className="size-5 shrink-0 text-fg-success" aria-hidden />
    ) : status === "current" ? (
      <PlayCircle className="size-5 shrink-0 text-fg-brand" aria-hidden />
    ) : (
      <Lock className="size-5 shrink-0 text-fg-disabled" aria-hidden />
    );

  const inner = (
    <>
      {icon}
      <div className="flex min-w-0 flex-1 flex-col">
        <p
          className={cn(
            "t-body-sm-strong truncate",
            status === "locked" ? "text-fg-disabled" : "text-fg-primary",
          )}
        >
          {title}
        </p>
        <p className="t-body-xs text-fg-tertiary">
          {kind} · {duration}
        </p>
      </div>
    </>
  );

  const classes = cn(
    "flex min-h-11 items-center gap-3 rounded-lg border px-3 py-2 outline-none transition-colors",
    status === "current"
      ? "border-stroke-brand bg-bg-selected"
      : status === "locked"
        ? "border-transparent"
        : "border-transparent hover:bg-bg-hover focus-visible:shadow-(--elev-focus)",
    className,
  );

  if (status === "locked") {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn(classes, "cursor-not-allowed")}>{inner}</div>
        </TooltipTrigger>
        <TooltipContent>{lockedReason ?? "This lesson is locked"}</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Link href={href ?? "#"} className={classes}>
      {inner}
    </Link>
  );
}

export { LessonRow };
