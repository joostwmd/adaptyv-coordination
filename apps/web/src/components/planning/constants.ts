import type { TaskOrigin, TaskReadiness } from "@/domain/task/types";
import type { WorkUnitStatus } from "@/domain/work-unit/types";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

export const TASK_READINESS_CONFIG: Record<
  TaskReadiness,
  { label: string; variant: BadgeVariant; className?: string }
> = {
  blocked: { label: "Blocked", variant: "destructive" },
  waiting_upstream: {
    label: "Waiting upstream",
    variant: "outline",
    className: "border-amber-500/50 text-amber-700 dark:text-amber-400",
  },
  ready: { label: "Ready", variant: "secondary" },
  batched: { label: "In work unit", variant: "outline" },
  in_labos: {
    label: "In LabOS",
    variant: "outline",
    className: "border-green-500/50 text-green-700 dark:text-green-400",
  },
};

export const TASK_ORIGIN_LABEL: Record<TaskOrigin, string> = {
  template: "From template",
  standalone: "Standalone",
  rerun: "Rerun",
};

export const WORK_UNIT_STATUS_CONFIG: Record<
  WorkUnitStatus,
  { label: string; variant: BadgeVariant }
> = {
  draft: { label: "Draft", variant: "secondary" },
  ready: { label: "Ready", variant: "outline" },
  sent: { label: "Sent", variant: "default" },
};
