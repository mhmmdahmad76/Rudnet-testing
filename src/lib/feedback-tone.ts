import { AlertCircle, AlertTriangle, CheckCircle2, Info, type LucideIcon } from "lucide-react";

export type FeedbackTone = "info" | "success" | "warning" | "danger";

export const FEEDBACK_TONE: Record<
  FeedbackTone,
  { container: string; icon: string; Icon: LucideIcon }
> = {
  info: {
    container: "border-stroke-info bg-bg-info-subtle",
    icon: "text-fg-info",
    Icon: Info,
  },
  success: {
    container: "border-stroke-success bg-bg-success-subtle",
    icon: "text-fg-success",
    Icon: CheckCircle2,
  },
  warning: {
    container: "border-stroke-warning bg-bg-warning-subtle",
    icon: "text-fg-warning",
    Icon: AlertTriangle,
  },
  danger: {
    container: "border-stroke-danger bg-bg-danger-subtle",
    icon: "text-fg-danger",
    Icon: AlertCircle,
  },
};
