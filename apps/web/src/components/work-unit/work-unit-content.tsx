import { Badge } from "@adaptyv-coordination/ui/components/badge";
import { cn } from "@adaptyv-coordination/ui/lib/utils";
import type { ReactNode } from "react";

import { WORK_UNIT_STATUS_CONFIG } from "@/components/planning/constants";
import { getWorkUnitTemplateLabel } from "@/components/planning/utils";
import { getCapacityStatus } from "@/domain/work-unit";
import type { WorkUnit } from "@/domain/work-unit/types";
import { useWorkUnitView } from "@/hooks/useWorkUnit";

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

type WorkUnitContentProps = {
  workUnit: WorkUnit;
  variant?: "default" | "compact";
  className?: string;
};

export function WorkUnitContent({
  workUnit,
  variant = "default",
  className,
}: WorkUnitContentProps) {
  const view = useWorkUnitView(workUnit);
  if (!view) return null;

  const statusConfig = WORK_UNIT_STATUS_CONFIG[workUnit.status];
  const capacity = getCapacityStatus(workUnit, view.tasks);
  const isCompact = variant === "compact";

  return (
    <article
      className={cn("flex flex-col gap-3", className)}
      aria-label={`Work unit ${workUnit.id}`}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold leading-snug text-foreground">
            {view.templateLabel}
          </h3>
          <p className="mt-0.5 font-mono text-xs text-muted-foreground">{workUnit.id}</p>
        </div>
        <Badge variant={statusConfig.variant} className="shrink-0 text-[11px] font-normal">
          {statusConfig.label}
        </Badge>
      </header>

      <div className="grid grid-cols-3 gap-2 rounded-md border border-border/60 bg-muted/30 px-3 py-2">
        <div className="text-center">
          <p className="text-[10px] text-muted-foreground">Tasks</p>
          <p className="text-sm font-semibold tabular-nums">{view.tasks.length}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-muted-foreground">Experiments</p>
          <p className="text-sm font-semibold tabular-nums">{view.experimentCount}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-muted-foreground">Capacity</p>
          <p
            className={cn(
              "text-sm font-semibold tabular-nums",
              !capacity.withinCapacity && "text-destructive",
            )}
          >
            {capacity.withinCapacity ? "OK" : "Over"}
          </p>
        </div>
      </div>

      {!isCompact ? (
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-border/50 pt-3">
          <PreviewField label="Template" value={getWorkUnitTemplateLabel(workUnit)} className="col-span-2" />
          {view.driverTaskTitle ? (
            <PreviewField label="Driver task" value={view.driverTaskTitle} className="col-span-2" />
          ) : null}
          <PreviewField label="Batch key" value={workUnit.workUnitKey} className="col-span-2" />
        </dl>
      ) : null}
    </article>
  );
}
