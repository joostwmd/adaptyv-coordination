import { cn } from "@adaptyv-coordination/ui/lib/utils";

import {
  EXPERIMENT_PRIORITY_LABEL,
  ExperimentHoverCard,
  ExperimentRunHoverCard,
  formatExperimentPriority,
} from "@/components/experiment";
import { getTaskTemplate } from "@/domain/task-template/catalog";
import { useExperimentById } from "@/stores/usePrototypeStore";
import { TaskPlanningLinks } from "./task-planning-links";
import type { ExperimentRunSummary, ExperimentSummary, Task } from "@/types";
import { getTaskDisplayName } from "@/types/task";

import { AssigneeRow } from "./primitives/assignee-row";
import { ExperimentLink } from "./primitives/experiment-link";
import { ExperimentRunLink } from "./primitives/experiment-run-link";
import { StatusBadge } from "./primitives/status-badge";

export type TaskContentProps = {
  task: Task;
  variant?: "default" | "embedded";
  experiment?: ExperimentSummary | null;
  run?: ExperimentRunSummary;
  showExperiment?: boolean;
  showRun?: boolean;
  showAssignee?: boolean;
  showPlanningLinks?: boolean;
  className?: string;
};

export function TaskContent({
  task,
  variant = "default",
  experiment: experimentProp,
  run: runProp,
  showExperiment = true,
  showRun = true,
  showAssignee = true,
  showPlanningLinks = true,
  className,
}: TaskContentProps) {
  const experimentFromStore = useExperimentById(task.experimentId ?? "");
  const summary =
    experimentProp ??
    (experimentFromStore
      ? (() => {
          const { runs: _runs, ...rest } = experimentFromStore;
          return rest;
        })()
      : null);

  const run =
    runProp ??
    (experimentFromStore && task.runId
      ? experimentFromStore.runs.find((entry) => entry.id === task.runId)
      : undefined);

  const templateName = getTaskTemplate(task.taskTemplateId)?.name;
  const title = getTaskDisplayName(task);
  const isEmbedded = variant === "embedded";

  const titleInner = (
    <>
      <h3
        className={cn(
          "font-semibold leading-snug text-foreground",
          isEmbedded ? "text-sm" : "text-base",
        )}
      >
        {title}
      </h3>
      {isEmbedded && templateName && templateName !== title ? (
        <p className="text-[11px] text-muted-foreground">{templateName}</p>
      ) : null}
    </>
  );

  const titleNode =
    run && summary && isEmbedded ? (
      <ExperimentRunHoverCard
        run={run}
        experiment={summary}
        trigger={
          <button
            type="button"
            className="min-w-0 flex-1 rounded-sm text-left outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
            onClick={(event) => event.stopPropagation()}
          >
            {titleInner}
          </button>
        }
      />
    ) : (
      <div className="min-w-0 flex-1">{titleInner}</div>
    );

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        {titleNode}
        <StatusBadge status={task.status} />
      </div>

      {showAssignee && task.assignee ? <AssigneeRow assignee={task.assignee} /> : null}

      {!isEmbedded && showExperiment && summary ? (
        <p className="text-xs/relaxed">
          <span className="text-muted-foreground">{EXPERIMENT_PRIORITY_LABEL} </span>
          <span className="font-medium">{formatExperimentPriority(summary.priority)}</span>
          <span className="text-muted-foreground"> ({summary.code})</span>
        </p>
      ) : null}

      {!isEmbedded && showRun && task.experimentId && task.runId ? (
        <ExperimentRunLink experimentId={task.experimentId} runId={task.runId} />
      ) : null}

      {!isEmbedded && showExperiment && summary ? (
        <ExperimentHoverCard
          experiment={summary}
          trigger={
            <span className="inline-block w-fit">
              <ExperimentLink experiment={summary} />
            </span>
          }
        />
      ) : null}

      {showPlanningLinks ? <TaskPlanningLinks task={task} /> : null}
    </div>
  );
}
