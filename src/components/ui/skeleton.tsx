import { cn } from "@/lib/utils";

function Skeleton({ className, style, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-bg-skeleton", className)}
      style={{ animationDuration: "1.5s", animationTimingFunction: "var(--ease-standard)", ...style }}
      {...props}
    />
  );
}

export { Skeleton };
