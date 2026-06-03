import { Badge } from "@adaptyv-coordination/ui/components/badge";
import { cn } from "@adaptyv-coordination/ui/lib/utils";
import { FlaskConical } from "lucide-react";

import {
  formatInputSampleCount,
  resolveInputSampleCount,
} from "@/domain/task/input-samples";
import type { Task } from "@/types";

type InputSampleCountBadgeProps = {
  task: Task;
  className?: string;
};

export function InputSampleCountBadge({ task, className }: InputSampleCountBadgeProps) {
  const count = resolveInputSampleCount(task);
  if (count === undefined) return null;

  return (
    <Badge
      variant="secondary"
      className={cn(
        "gap-1 font-normal tabular-nums text-foreground",
        className,
      )}
    >
      <FlaskConical className="size-3 shrink-0" aria-hidden />
      {formatInputSampleCount(count)}
    </Badge>
  );
}
