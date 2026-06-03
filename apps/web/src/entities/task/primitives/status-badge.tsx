import { Badge } from "@adaptyv-coordination/ui/components/badge";

import { TASK_STATUS_CONFIG } from "../constants";
import type { TaskStatus } from "@/types";

type StatusBadgeProps = {
  status: TaskStatus;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = TASK_STATUS_CONFIG[status];

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
