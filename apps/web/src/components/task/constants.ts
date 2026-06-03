import type { TaskStatus } from "@/types";

type TaskStatusConfig = {
  label: string;
  variant: "secondary" | "default" | "destructive" | "outline";
};

export const TASK_STATUS_CONFIG: Record<TaskStatus, TaskStatusConfig> = {
  pending: {
    label: "Pending",
    variant: "secondary",
  },
  in_progress: {
    label: "In progress",
    variant: "default",
  },
  completed: {
    label: "Completed",
    variant: "default",
  },
  failed: {
    label: "Failed",
    variant: "destructive",
  },
  blocked: {
    label: "Blocked",
    variant: "outline",
  },
  cancelled: {
    label: "Cancelled",
    variant: "outline",
  },
};
