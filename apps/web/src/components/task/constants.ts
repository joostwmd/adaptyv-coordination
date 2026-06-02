import type { TaskStatus } from "@/types";

type TaskStatusConfig = {
  label: string;
  variant: "secondary" | "default" | "destructive";
};

export const TASK_STATUS_CONFIG: Record<TaskStatus, TaskStatusConfig> = {
  pending: {
    label: "Pending",
    variant: "secondary",
  },
  success: {
    label: "Success",
    variant: "default",
  },
  failed: {
    label: "Failed",
    variant: "destructive",
  },
};
