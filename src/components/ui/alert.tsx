import * as React from "react";

import { cn } from "@/lib/utils";
import { FEEDBACK_TONE, type FeedbackTone } from "@/lib/feedback-tone";

export interface AlertProps {
  tone: FeedbackTone;
  title: string;
  body?: string;
  className?: string;
  children?: React.ReactNode;
}

/** Inline, inside a card or form — see Banner for full-bleed. */
function Alert({ tone, title, body, className, children }: AlertProps) {
  const { container, icon, Icon } = FEEDBACK_TONE[tone];
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={cn("flex gap-3 rounded-lg border p-4", container, className)}
    >
      <Icon className={cn("size-5 shrink-0", icon)} aria-hidden />
      <div className="flex flex-col gap-1">
        <p className="t-body-sm-strong text-fg-primary">{title}</p>
        {body && <p className="t-body-sm text-fg-secondary">{body}</p>}
        {children}
      </div>
    </div>
  );
}

export { Alert };
