import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { IconChip } from "@/components/lisaan/icon-chip";

export interface EmptyStateAction {
  label: string;
  onClick: () => void;
}

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  body: string;
  action?: EmptyStateAction;
  secondaryActions?: EmptyStateAction[];
  className?: string;
}

/** Names what will appear and gives the action that fills it. */
function EmptyState({ icon, title, body, action, secondaryActions, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center gap-3 py-16 text-center", className)}>
      <IconChip icon={icon} tone="neutral" size="lg" />
      <div className="flex flex-col gap-1">
        <p className="t-h5 text-fg-primary">{title}</p>
        <p className="t-body-sm max-w-sm text-fg-tertiary">{body}</p>
      </div>
      {(action || (secondaryActions && secondaryActions.length > 0)) && (
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
          {action && <Button onClick={action.onClick}>{action.label}</Button>}
          {secondaryActions?.map((secondary) => (
            <Button key={secondary.label} variant="secondary" onClick={secondary.onClick}>
              {secondary.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}

export { EmptyState };
