import { Badge } from "@adaptyv-coordination/ui/components/badge";
import { cn } from "@adaptyv-coordination/ui/lib/utils";
import type { ReactNode } from "react";

import { WORK_UNIT_STATUS_CONFIG } from "@/components/planning/constants";
import { getCapacityStatus } from "@/domain/work-unit";
import type { WorkUnit } from "@/domain/work-unit/types";
import type { EnrichedWorkUnit } from "@/hooks/useWorkUnit";

export type WorkUnitContentHeaderProps = {
  workUnit: WorkUnit;
  view: EnrichedWorkUnit;
  variant?: "default" | "compact";
  headerEnd?: ReactNode;
  className?: string;
};

export function WorkUnitContentHeader({
  workUnit,
  view,
  variant = "default",
  headerEnd,
  className,
}: WorkUnitContentHeaderProps) {
  const statusConfig = WORK_UNIT_STATUS_CONFIG[workUnit.status];
  const capacity = getCapacityStatus(workUnit, view.tasks);
  const isCompact = variant === "compact";

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3
            className={cn(
              "font-semibold leading-snug text-foreground",
              isCompact ? "text-base" : "text-sm",
            )}
          >
            {view.templateLabel}
          </h3>
          <p className="mt-0.5 font-mono text-xs text-muted-foreground">{workUnit.id}</p>
        </div>
        <div className="flex shrink-0 items-start gap-2">
          <Badge variant={statusConfig.variant} className="text-[11px] font-normal">
            {statusConfig.label}
          </Badge>
          {headerEnd}
        </div>
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
    </div>
  );
}
