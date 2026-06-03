import { Badge } from "@adaptyv-coordination/ui/components/badge";
import { cn } from "@adaptyv-coordination/ui/lib/utils";
import type { ReactNode } from "react";

import {
  EXPERIMENT_CATEGORY_LABEL,
  EXPERIMENT_TYPE_LABEL,
  type ExperimentSummary,
} from "@/types";

import {
  formatExperimentStatus,
  getExperimentStatusBadgeVariant,
} from "./experiment-run-status";
import {
  EXPERIMENT_PRIORITY_HINT,
  EXPERIMENT_PRIORITY_LABEL,
  formatExperimentPriority,
} from "./experiment-priority";

export type ExperimentContentProps = {
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

export function ExperimentContent({
  experiment,
  variant = "default",
  className,
}: ExperimentContentProps) {
  const typeLabel = experiment.typeLabel ?? EXPERIMENT_TYPE_LABEL[experiment.type];
  const isCompact = variant === "compact";

  return (
    <article
      className={cn("flex flex-col gap-3", className)}
      aria-label={`Experiment ${experiment.code}`}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3
            className={cn(
              "font-semibold leading-snug text-foreground",
              isCompact ? "text-base" : "text-sm",
            )}
          >
            {experiment.name}
          </h3>
          <p className="mt-0.5 font-mono text-xs text-muted-foreground">{experiment.code}</p>
        </div>
        <Badge
          variant={getExperimentStatusBadgeVariant(experiment.status)}
          className="shrink-0 text-[11px] font-normal"
        >
          {formatExperimentStatus(experiment.status)}
        </Badge>
      </header>

      <div className="flex items-center justify-between gap-3 rounded-md border border-border/60 bg-muted/30 px-3 py-2">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{EXPERIMENT_PRIORITY_LABEL}</p>
          {!isCompact ? (
            <p className="text-[10px] leading-snug text-muted-foreground/80">
              {EXPERIMENT_PRIORITY_HINT}
            </p>
          ) : null}
        </div>
        <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
          {formatExperimentPriority(experiment.priority)}
        </span>
      </div>

      {!isCompact ? (
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-border/50 pt-3">
          <PreviewField label="Type" value={typeLabel} />
          <PreviewField label="Category" value={EXPERIMENT_CATEGORY_LABEL[experiment.category]} />
          <PreviewField label="Client" value={experiment.client.name} className="col-span-2" />
          {experiment.methodName ? (
            <PreviewField label="Method" value={experiment.methodName} className="col-span-2" />
          ) : null}
        </dl>
      ) : null}
    </article>
  );
}
