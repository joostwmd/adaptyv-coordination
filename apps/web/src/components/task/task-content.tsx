import { cn } from "@adaptyv-coordination/ui/lib/utils";

import { ParameterSummary } from "@/components/planning/parameter-summary";
import { PriorityIndicator } from "@/components/planning/priority-indicator";
import { ReadinessBadge } from "@/components/planning/readiness-badge";
import { TaskTypeBadge } from "@/components/planning/task-type-badge";
import { useEnrichedTask } from "@/hooks/usePlanningTask";
import type { ExperimentRunSummary, ExperimentSummary, Task } from "@/types";

import { StatusBadge } from "./primitives/status-badge";
import { TaskNameBadge } from "./primitives/task-name-badge";
import { TaskReferences, type TaskReferenceKey } from "./task-references";

export type TaskContentProps = {
  task: Task;
  variant?: "standalone" | "compact";
  experiment?: ExperimentSummary | null;
  run?: ExperimentRunSummary;
  hide?: TaskReferenceKey[];
  className?: string;
};

export function TaskContent({
  task,
  variant = "standalone",
  experiment: experimentProp,
  run: runProp,
  hide,
  className,
}: TaskContentProps) {
  const enriched = useEnrichedTask(task);
  const isCompact = variant === "compact";

  if (!enriched) return null;

  const showReadiness =
    (!isCompact && task.readiness !== "batched") ||
    (isCompact && task.readiness !== "batched" && task.readiness !== "ready");

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex flex-wrap items-center gap-1.5">
        {showReadiness ? <ReadinessBadge readiness={task.readiness} /> : null}
        {!isCompact ? <TaskTypeBadge label={enriched.templateName} /> : null}
        <TaskNameBadge task={task} />
        <StatusBadge status={task.status} />
        <div className="ml-auto">
          <PriorityIndicator priority={enriched.priority} stopPropagation />
        </div>
      </div>

      <ParameterSummary task={task} showHeading={!isCompact} />

      <TaskReferences
        task={task}
        experiment={experimentProp ?? enriched.experiment}
        run={runProp}
        hide={hide}
      />
    </div>
  );
}
