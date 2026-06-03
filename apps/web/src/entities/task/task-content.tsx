import { RelativeTimeCard } from "@adaptyv-coordination/ui/components/relative-time-card";
import { cn } from "@adaptyv-coordination/ui/lib/utils";

import { ParameterSummary } from "@/shared/summaries/parameter-summary";
import { RequiredPlatesSummary } from "@/entities/task/required-plates-summary";
import { PriorityIndicator } from "@/shared/badges/priority-indicator";
import { ReadinessBadge } from "@/shared/badges/readiness-badge";
import { TaskTypeBadge } from "@/shared/badges/task-type-badge";
import { BLOCKED_REASON_LABEL } from "@/domain/blocked-reason";
import { useEnrichedTask } from "@/hooks/usePlanningTask";
import type {
  ExperimentRunSummary,
  ExperimentSummary,
  Task,
  TaskReadiness,
} from "@/types";

import { InputSampleCountBadge } from "./primitives/input-sample-count-badge";
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

function shouldShowReadiness(readiness: TaskReadiness, isCompact: boolean): boolean {
  if (readiness === "ready") return false;
  if (isCompact && readiness === "batched") return false;
  return true;
}

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

  const showReadiness = shouldShowReadiness(task.readiness, isCompact);
  const blockedLabel = task.blockedReason
    ? BLOCKED_REASON_LABEL[task.blockedReason]
    : null;

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex flex-wrap items-center gap-1.5">
        <StatusBadge status={task.status} />
        <InputSampleCountBadge task={task} />
        {showReadiness ? <ReadinessBadge readiness={task.readiness} /> : null}
        {!isCompact ? <TaskTypeBadge label={enriched.templateName} /> : null}
        {!isCompact ? <TaskNameBadge task={task} /> : null}
        <div className="ml-auto">
          <PriorityIndicator priority={enriched.priority} stopPropagation />
        </div>
      </div>

      {blockedLabel ? (
        <p className="text-sm text-destructive">{blockedLabel}</p>
      ) : null}

      <div className="flex flex-col gap-3">
        <RequiredPlatesSummary
          task={task}
          showHeading={!isCompact}
          variant={isCompact ? "card" : "card"}
        />
        <ParameterSummary task={task} showHeading={!isCompact} />
      </div>

      <TaskReferences
        task={task}
        experiment={experimentProp ?? enriched.experiment}
        run={runProp}
        hide={hide}
      />

      {!isCompact ? (
        <footer className="space-y-1 border-t border-border/50 pt-3 text-[11px] text-muted-foreground">
          <p className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
            <span>Added</span>
            <RelativeTimeCard
              date={new Date(task.createdAt)}
              variant="ghost"
              className="inline h-auto p-0 text-[11px] font-normal text-muted-foreground whitespace-nowrap"
              updateInterval={60_000}
            />
            <span aria-hidden>·</span>
            <span className="capitalize">{task.origin}</span>
          </p>
          <p className="font-mono text-[10px]">{task.id}</p>
        </footer>
      ) : null}
    </div>
  );
}
