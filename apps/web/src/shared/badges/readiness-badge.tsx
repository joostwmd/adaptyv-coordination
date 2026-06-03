import { Badge } from "@adaptyv-coordination/ui/components/badge";
import { cn } from "@adaptyv-coordination/ui/lib/utils";

import { TASK_READINESS_CONFIG } from "@/shared/badges/constants";
import type { TaskReadiness } from "@/domain/task/types";

type ReadinessBadgeProps = {
  readiness: TaskReadiness;
  className?: string;
};

export function ReadinessBadge({ readiness, className }: ReadinessBadgeProps) {
  const config = TASK_READINESS_CONFIG[readiness];
  return (
    <Badge variant={config.variant} className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}
