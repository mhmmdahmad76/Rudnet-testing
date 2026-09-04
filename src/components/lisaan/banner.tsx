"use client";

import * as React from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import { FEEDBACK_TONE, type FeedbackTone } from "@/lib/feedback-tone";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/lisaan/icon-button";

export interface BannerProps {
  tone: FeedbackTone;
  title: string;
  body?: string;
  action?: { label: string; onClick: () => void };
  onDismiss?: () => void;
  className?: string;
}

/** Full-bleed at the top of a region. Alert is inside a container; this spans one. */
function Banner({ tone, title, body, action, onDismiss, className }: BannerProps) {
  const { container, icon, Icon } = FEEDBACK_TONE[tone];
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={cn("flex w-full items-start gap-3 border px-4 py-3", container, className)}
    >
      <Icon className={cn("size-5 shrink-0", icon)} aria-hidden />
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-4 gap-y-2">
        <div className="flex flex-col gap-0.5">
          <p className="t-body-sm-strong text-fg-primary">{title}</p>
          {body && <p className="t-body-sm text-fg-secondary">{body}</p>}
        </div>
        {action && (
          <Button variant="secondary" size="sm" onClick={action.onClick}>
            {action.label}
          </Button>
        )}
      </div>
      {onDismiss && (
        <IconButton aria-label="Dismiss" variant="ghost" size="sm" onClick={onDismiss}>
          <X aria-hidden />
        </IconButton>
      )}
    </div>
  );
}

export { Banner };
