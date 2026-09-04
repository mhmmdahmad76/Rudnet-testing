"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

export function Toaster({ dir = "ltr", ...props }: ToasterProps) {
  return (
    <Sonner
      theme="light"
      dir={dir}
      position={dir === "rtl" ? "bottom-left" : "bottom-right"}
      duration={5000}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--bg-surface)",
          "--normal-text": "var(--fg-primary)",
          "--normal-border": "var(--stroke-default)",
          "--border-radius": "var(--radius-lg)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
}
