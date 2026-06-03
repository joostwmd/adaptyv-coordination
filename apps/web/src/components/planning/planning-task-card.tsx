import { useState } from "react";
import type { Task } from "@/domain/task/types";
import { useEnrichedTask } from "@/hooks/usePlanningTask";
import { motion } from "motion/react";

import { ExperimentCodeHover, ExperimentDetailDialog } from "@/components/experiment";
import { TaskPlanningLinks } from "@/components/task/task-planning-links";

import { ParameterSummary } from "./parameter-summary";
import { PriorityIndicator } from "./priority-indicator";
import { ReadinessBadge } from "./readiness-badge";
import { TaskCardCell } from "./task-card-cell";
import { TaskTypeBadge } from "./task-type-badge";

type PlanningTaskCardProps = {
  task: Task;
  onOpen: (task: Task) => void;
  variant?: "standalone" | "compact";
  layoutId?: string;
};

export function PlanningTaskCard({
  task,
  onOpen,
  variant = "standalone",
  layoutId,
}: PlanningTaskCardProps) {
  const enriched = useEnrichedTask(task);
  const [experimentDialogOpen, setExperimentDialogOpen] = useState(false);

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

  const subtitle = isCompact ? (
    experiment?.name
  ) : experiment ? (
    <button
      type="button"
      className="rounded-sm text-left font-mono text-xs font-medium text-muted-foreground underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring"
      onClick={(event) => {
        event.stopPropagation();
        setExperimentDialogOpen(true);
      }}
      onPointerDown={(event) => event.stopPropagation()}
    >
      {experiment.code}
    </button>
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

  const content = (
    <>
      <TaskCardCell
        title={title}
        subtitle={subtitle}
        headerStart={headerStart}
        headerEnd={<PriorityIndicator priority={enriched.priority} stopPropagation />}
        onOpen={() => onOpen(task)}
        variant={variant}
      >
        <ParameterSummary task={task} showHeading={!isCompact} />
        <TaskPlanningLinks task={task} className="mt-2" />
        {!experiment && !isCompact ? (
          <p className="mt-2 text-xs text-muted-foreground">No experiment linked</p>
        ) : null}
      </TaskCardCell>
      {experiment ? (
        <ExperimentDetailDialog
          experiment={experiment}
          open={experimentDialogOpen}
          onOpenChange={setExperimentDialogOpen}
        />
      ) : null}
    </>
  );

  if (!layoutId) return content;

  return <motion.div layoutId={layoutId}>{content}</motion.div>;
}
