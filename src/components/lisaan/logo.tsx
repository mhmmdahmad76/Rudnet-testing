import * as React from "react";

import { cn } from "@/lib/utils";

export interface LogoProps extends React.HTMLAttributes<HTMLSpanElement> {
  type?: "mark" | "lockup";
  tone?: "colour" | "mono";
}

/** A brand mark and a Latin wordmark — neither ever mirrors in RTL. */
function Logo({ type = "lockup", tone = "colour", className, ...props }: LogoProps) {
  const markFill = tone === "colour" ? "var(--bg-brand)" : "currentColor";
  const glyphStroke = tone === "colour" ? "var(--fg-on-brand)" : "var(--bg-canvas)";

  return (
    <span
      dir="ltr"
      className={cn("inline-flex items-center gap-2", className)}
      {...props}
    >
      <svg
        width="28"
        height="28"
        viewBox="0 0 28 28"
        fill="none"
        aria-hidden={type === "lockup" || undefined}
        role={type === "mark" ? "img" : undefined}
        aria-label={type === "mark" ? "Lisaan" : undefined}
      >
        <rect width="28" height="28" rx="8" fill={markFill} />
        <path
          d="M9 8v9.5a2.5 2.5 0 0 0 2.5 2.5H19"
          stroke={glyphStroke}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {type === "lockup" && (
        <span className={cn("t-h5", tone === "mono" ? "text-current" : "text-fg-primary")}>
          Lisaan
        </span>
      )}
    </span>
  );
}

export { Logo };
