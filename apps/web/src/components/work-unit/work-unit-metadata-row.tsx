import { cn } from "@adaptyv-coordination/ui/lib/utils";

import { getCapacityStatus } from "@/domain/work-unit";
import type { WorkUnit } from "@/domain/work-unit/types";
import type { EnrichedWorkUnit } from "@/hooks/useWorkUnit";

export type WorkUnitMetadataRowProps = {
  workUnit: WorkUnit;
  view: EnrichedWorkUnit;
  className?: string;
};

export function WorkUnitMetadataRow({ workUnit, view, className }: WorkUnitMetadataRowProps) {
  const capacity = getCapacityStatus(workUnit, view.tasks);

  return (
    <dl
      className={cn(
        "grid grid-cols-3 divide-x divide-border/60 overflow-hidden rounded-lg border border-border/60 bg-muted/25",
        className,
      )}
    >
      <div className="min-w-0 px-3 py-2.5">
        <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Tasks
        </dt>
        <dd className="mt-1 text-sm font-semibold tabular-nums text-foreground">
          {view.tasks.length}
        </dd>
      </div>
      <div className="min-w-0 px-3 py-2.5">
        <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Experiments
        </dt>
        <dd className="mt-1 text-sm font-semibold tabular-nums text-foreground">
          {view.experimentCount}
        </dd>
      </div>
      <div className="min-w-0 px-3 py-2.5">
        <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Capacity
        </dt>
        <dd
          className={cn(
            "mt-1 text-sm font-semibold tabular-nums",
            capacity.withinCapacity ? "text-foreground" : "text-destructive",
          )}
        >
          {capacity.withinCapacity ? "OK" : "Over"}
        </dd>
      </div>
    </dl>
  );
}
