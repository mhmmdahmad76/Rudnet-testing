"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const avatarVariants = cva("relative flex shrink-0 overflow-hidden rounded-full", {
  variants: {
    size: {
      sm: "size-8 t-label-sm",
      md: "size-10 t-label-md",
      lg: "size-14 t-h5",
    },
  },
  defaultVariants: { size: "md" },
});

/** Same student, same colour — every time. */
const TINTS = [
  "bg-bg-brand-subtle text-fg-brand",
  "bg-bg-success-subtle text-fg-success",
  "bg-bg-warning-subtle text-fg-warning",
  "bg-bg-danger-subtle text-fg-danger",
  "bg-bg-achievement-subtle text-fg-achievement",
  "bg-bg-info-subtle text-fg-info",
];

function hashName(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function initialsFor(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

export interface AvatarProps
  extends Omit<React.ComponentProps<typeof AvatarPrimitive.Root>, "children">,
    VariantProps<typeof avatarVariants> {
  src?: string;
  name: string;
}

function Avatar({ className, size, src, name, ...props }: AvatarProps) {
  const tint = TINTS[hashName(name) % TINTS.length];
  return (
    <AvatarPrimitive.Root className={cn(avatarVariants({ size }), className)} {...props}>
      {src && (
        <AvatarPrimitive.Image
          className="aspect-square size-full object-cover"
          src={src}
          alt={name}
        />
      )}
      <AvatarPrimitive.Fallback
        className={cn("flex size-full items-center justify-center font-medium", tint)}
        delayMs={src ? 400 : 0}
      >
        {initialsFor(name)}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
}

export { Avatar };
