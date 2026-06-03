import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useMemo } from "react";

import {
  ExperimentCodeHover,
  ExperimentRunHoverCard,
} from "@/entities/experiment";
import { TaskCardCell } from "@/shared/layout/task-card-cell";
import { useEnrichedTask } from "@/hooks/usePlanningTask";
import { useExperimentById } from "@/stores/usePrototypeStore";
import type { ExperimentRunSummary, ExperimentSummary, Task } from "@/types";

import { TaskContent } from "./task-content";
import type { TaskReferenceKey } from "./task-references";

export type TaskCardProps = {
  task: Task;
  variant?: "standalone" | "compact" | "embedded";
  layoutId?: string;
  hide?: TaskReferenceKey[];
  experiment?: ExperimentSummary | null;
  run?: ExperimentRunSummary;
};

function mergeReferenceHide(
  hide: TaskReferenceKey[] | undefined,
  extra: TaskReferenceKey[],
): TaskReferenceKey[] | undefined {
  if (extra.length === 0 && !hide?.length) return hide;
  return [...new Set([...(hide ?? []), ...extra])];
}

export function TaskCard({
  task,
  variant = "standalone",
  layoutId,
  hide,
  experiment,
  run,
}: TaskCardProps) {
  const enriched = useEnrichedTask(task);
  const experimentFromStore = useExperimentById(task.experimentId ?? "");

  if (!enriched) return null;

  const cellVariant = variant === "embedded" ? "compact" : variant;
  const isCompact = cellVariant === "compact";
  const exp =
    experiment ??
    enriched.experiment ??
    (experimentFromStore
      ? (() => {
          const { runs: _runs, ...rest } = experimentFromStore;
          return rest;
        })()
      : null);

  const resolvedRun =
    run ??
    (experimentFromStore && task.runId
      ? experimentFromStore.runs.find((entry) => entry.id === task.runId)
      : undefined);

  const referenceHide = useMemo(
    () =>
      mergeReferenceHide(
        hide,
        isCompact && exp ? ["experiment", "run"] : [],
      ),
    [hide, isCompact, exp],
  );

  const title =
    isCompact && exp ? (
      <ExperimentCodeHover experiment={exp} linkClassName="text-sm" />
    ) : (
      enriched.title
    );

  const subtitle =
    isCompact && exp ? (
      resolvedRun ? (
        <ExperimentRunHoverCard
          run={resolvedRun}
          experiment={exp}
          trigger={
            <Link
              to="/experiments/$experimentId"
              params={{ experimentId: exp.id }}
              className="w-fit rounded-sm font-medium text-foreground underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring"
              onClick={(event) => event.stopPropagation()}
              onPointerDown={(event) => event.stopPropagation()}
            >
              R{resolvedRun.revisionIndex} · {resolvedRun.name}
            </Link>
          }
        />
      ) : (
        exp.name
      )
    ) : exp ? (
      exp.name
    ) : undefined;

  const card = (
    <TaskCardCell title={title} subtitle={subtitle} variant={cellVariant}>
      <TaskContent
        task={task}
        variant={cellVariant}
        experiment={exp}
        run={resolvedRun}
        hide={referenceHide}
      />
    </TaskCardCell>
  );

  if (!layoutId) return card;

  return <motion.div layoutId={layoutId}>{card}</motion.div>;
}
