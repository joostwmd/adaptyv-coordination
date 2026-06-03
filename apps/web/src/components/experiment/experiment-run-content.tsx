import { Badge } from "@adaptyv-coordination/ui/components/badge";
import { cn } from "@adaptyv-coordination/ui/lib/utils";
import type { ReactNode } from "react";

import type { ExperimentRunSummary, ExperimentSummary } from "@/types";

import {
  formatRunDateRange,
  formatRunStatus,
  getRunStatusBadgeVariant,
} from "./experiment-run-status";

export type ExperimentRunContentProps = {
  run: ExperimentRunSummary;
  experiment: ExperimentSummary;
  variant?: "default" | "compact";
  className?: string;
};

type PreviewFieldProps = {
  label: string;
  value: ReactNode;
  className?: string;
};

function PreviewField({ label, value, className }: PreviewFieldProps) {
  return (
    <div className={cn("min-w-0", className)}>
      <dt className="text-[11px] leading-none text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-xs font-medium leading-snug text-foreground">{value}</dd>
    </div>
  );
}

export function ExperimentRunContent({
  run,
  experiment,
  variant = "default",
  className,
}: ExperimentRunContentProps) {
  const dateRange = formatRunDateRange(run);
  const isCompact = variant === "compact";

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
            {isCompact ? (
              <>
                {" "}
                · {run.taskCount} task{run.taskCount === 1 ? "" : "s"}
                {run.completedTaskCount > 0 ? ` · ${run.completedTaskCount} done` : ""}
                {run.failedTaskCount > 0 ? ` · ${run.failedTaskCount} failed` : ""}
              </>
            ) : null}
          </p>
        </div>
        <Badge
          variant={getRunStatusBadgeVariant(run.status)}
          className="shrink-0 text-[11px] font-normal"
        >
          {formatRunStatus(run.status)}
        </Badge>
      </header>

      {!isCompact ? (
        <>
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

          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-border/50 pt-3">
            <PreviewField label="Experiment" value={experiment.name} className="col-span-2" />
            {dateRange ? (
              <PreviewField label="Timeline" value={dateRange} className="col-span-2" />
            ) : null}
            <PreviewField
              label="Created"
              value={new Date(run.createdAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            />
            {experiment.methodName ? (
              <PreviewField label="Method" value={experiment.methodName} />
            ) : null}
          </dl>
        </>
      ) : null}
    </article>
  );
}
