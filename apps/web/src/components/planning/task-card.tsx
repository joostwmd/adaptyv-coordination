import type { Task } from "@/domain/task/types";
import { useEnrichedTask } from "@/hooks/usePlanningTask";

import { ExperimentCodeHover } from "@/components/experiment";

import { ParameterSummary } from "./parameter-summary";
import { PriorityIndicator } from "./priority-indicator";
import { ReadinessBadge } from "./readiness-badge";
import { TaskCardCell } from "./task-card-cell";
import { ExperimentLink } from "@/components/task/primitives/experiment-link";
import { TaskTypeBadge } from "./task-type-badge";

type TaskCardProps = {
  task: Task;
  onOpen: (task: Task) => void;
  variant?: "standalone" | "compact";
};

export function TaskCard({ task, onOpen, variant = "standalone" }: TaskCardProps) {
  const enriched = useEnrichedTask(task);
  if (!enriched) return null;

  const isCompact = variant === "compact";
  const experiment = enriched.experiment;

  const title = isCompact ? (
    experiment ? (
      <ExperimentCodeHover experiment={experiment} linkClassName="text-sm" />
    ) : (
      enriched.title
    )
  ) : (
    enriched.title
  );

  const subtitle = isCompact
    ? experiment?.name
    : experiment ? (
        <ExperimentLink experiment={experiment} showLabel={false} codeOnly />
      ) : undefined;

  const showReadiness =
    (!isCompact && task.readiness !== "batched") ||
    (isCompact && task.readiness !== "batched" && task.readiness !== "ready");

  const headerStart =
    showReadiness || !isCompact ? (
      <>
        {showReadiness ? <ReadinessBadge readiness={task.readiness} /> : null}
        {!isCompact ? <TaskTypeBadge label={enriched.templateName} /> : null}
      </>
    ) : undefined;

  return (
    <TaskCardCell
      title={title}
      subtitle={subtitle}
      headerStart={headerStart}
      headerEnd={<PriorityIndicator priority={enriched.priority} stopPropagation />}
      onOpen={() => onOpen(task)}
      variant={variant}
    >
      <ParameterSummary task={task} showHeading={!isCompact} />
      {!experiment && !isCompact ? (
        <p className="mt-2 text-xs text-muted-foreground">No experiment linked</p>
      ) : null}
    </TaskCardCell>
  );
}
