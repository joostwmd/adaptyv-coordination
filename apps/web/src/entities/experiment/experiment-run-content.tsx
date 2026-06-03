import { Badge } from "@adaptyv-coordination/ui/components/badge";
import { cn } from "@adaptyv-coordination/ui/lib/utils";
import type { ReactNode } from "react";
import { useMemo } from "react";

import { CollapsibleTaskList } from "@/components/task/collapsible-task-list";
import type { TaskReferenceKey } from "@/components/task/task-references";
import { useTasksByRun } from "@/hooks/useTasks";
import type { ExperimentRunSummary, ExperimentSummary, Task } from "@/types";
import { getTaskDisplayName } from "@/types/task";

import {
  formatRunDateRange,
  formatRunStatus,
  getRunStatusBadgeVariant,
} from "./experiment-run-status";

export type ExperimentRunContentProps = {
  run: ExperimentRunSummary;
  experiment: ExperimentSummary;
  variant?: "default" | "compact";
  showTasks?: boolean;
  defaultTasksOpen?: boolean;
  renderTask?: (task: Task) => ReactNode;
  taskListHide?: TaskReferenceKey[];
  className?: string;
};

type RunMetaItemProps = {
  label: string;
  value: ReactNode;
};

function RunMetaItem({ label, value }: RunMetaItemProps) {
  return (
    <div className="inline-flex min-w-0 items-center gap-1.5 text-xs">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="min-w-0 font-medium text-foreground">{value}</span>
    </div>
  );
}

function RunMetaRow({
  run,
  experiment,
  dateRange,
}: {
  run: ExperimentRunSummary;
  experiment: ExperimentSummary;
  dateRange: string | null;
}) {
  const created = new Date(run.createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border/50 pt-3">
      <RunMetaItem label="Created" value={created} />
      {dateRange ? <RunMetaItem label="Timeline" value={dateRange} /> : null}
      {experiment.methodName ? (
        <RunMetaItem label="Method" value={experiment.methodName} />
      ) : null}
    </div>
  );
}

export function ExperimentRunContent({
  run,
  experiment,
  variant = "default",
  showTasks = false,
  defaultTasksOpen = false,
  renderTask,
  taskListHide = ["run", "experiment"],
  className,
}: ExperimentRunContentProps) {
  const dateRange = formatRunDateRange(run);
  const isCompact = variant === "compact";
  const runTasks = useTasksByRun(run.id);

  const tasks = useMemo(
    () =>
      [...runTasks].sort((a, b) =>
        getTaskDisplayName(a).localeCompare(getTaskDisplayName(b)),
      ),
    [runTasks],
  );

  return (
    <article
      className={cn("flex flex-col gap-3", className)}
      aria-label={`Run ${run.name}`}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3
            className={cn(
              "font-semibold leading-snug text-foreground",
              isCompact ? "text-base" : "text-sm",
            )}
          >
            {run.name}
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Revision {run.revisionIndex} · {experiment.code}
          </p>
        </div>
        <Badge
          variant={getRunStatusBadgeVariant(run.status)}
          className="shrink-0 text-[11px] font-normal"
        >
          {formatRunStatus(run.status)}
        </Badge>
      </header>

      <div className="grid grid-cols-3 gap-2 rounded-md border border-border/60 bg-muted/30 px-3 py-2">
        <div className="text-center">
          <p className="text-[10px] text-muted-foreground">Tasks</p>
          <p className="text-sm font-semibold tabular-nums">{run.taskCount}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-muted-foreground">Done</p>
          <p className="text-sm font-semibold tabular-nums">{run.completedTaskCount}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-muted-foreground">Failed</p>
          <p className="text-sm font-semibold tabular-nums text-destructive">
            {run.failedTaskCount}
          </p>
        </div>
      </div>

      {!isCompact ? (
        <RunMetaRow run={run} experiment={experiment} dateRange={dateRange} />
      ) : null}

      {showTasks ? (
        <CollapsibleTaskList
          tasks={tasks}
          renderTask={renderTask}
          hide={taskListHide}
          defaultOpen={defaultTasksOpen}
        />
      ) : null}
    </article>
  );
}
