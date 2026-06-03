import { motion } from "motion/react";

import { ExperimentCodeHover } from "@/components/experiment";
import { TaskCardCell } from "@/components/planning/task-card-cell";
import { useEnrichedTask } from "@/hooks/usePlanningTask";
import type { ExperimentRunSummary, ExperimentSummary, Task } from "@/types";

import { TaskContent } from "./task-content";
import type { TaskReferenceKey } from "./task-references";

export type TaskCardProps = {
  task: Task;
  onOpen?: (task: Task) => void;
  variant?: "standalone" | "compact" | "embedded";
  layoutId?: string;
  hide?: TaskReferenceKey[];
  experiment?: ExperimentSummary | null;
  run?: ExperimentRunSummary;
};

export function TaskCard({
  task,
  onOpen,
  variant = "standalone",
  layoutId,
  hide,
  experiment,
  run,
}: TaskCardProps) {
  const enriched = useEnrichedTask(task);

  if (!enriched) return null;

  const cellVariant = variant === "embedded" ? "compact" : variant;
  const isCompact = cellVariant === "compact";
  const exp = experiment ?? enriched.experiment;

  const title = isCompact && exp ? (
    <ExperimentCodeHover experiment={exp} linkClassName="text-sm" />
  ) : (
    enriched.title
  );

  const subtitle =
    isCompact && exp
      ? exp.name
      : exp
        ? exp.name
        : undefined;

  const card = (
    <TaskCardCell
      title={title}
      subtitle={subtitle}
      headerEnd={null}
      onOpen={onOpen ? () => onOpen(task) : undefined}
      variant={cellVariant}
    >
      <TaskContent
        task={task}
        variant={cellVariant}
        experiment={experiment ?? enriched.experiment}
        run={run}
        hide={hide}
      />
    </TaskCardCell>
  );

  if (!layoutId) return card;

  return <motion.div layoutId={layoutId}>{card}</motion.div>;
}
