import { cn } from "@adaptyv-coordination/ui/lib/utils";

import { aggregateInputSampleCount } from "@/domain/task/input-samples";
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
  const totalSamples = aggregateInputSampleCount(view.tasks);

  return (
    <div
      className={cn(
        "rounded-lg border border-border/60 bg-background/80 p-3",
        className,
      )}
    >
      <dl className="grid gap-x-4 gap-y-2.5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="min-w-0">
          <dt className="text-xs text-muted-foreground">Tasks</dt>
          <dd className="text-sm font-semibold tabular-nums text-foreground">
            {view.tasks.length}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-xs text-muted-foreground">Experiments</dt>
          <dd className="text-sm font-semibold tabular-nums text-foreground">
            {view.experimentCount}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-xs text-muted-foreground">Samples</dt>
          <dd className="text-sm font-semibold tabular-nums text-foreground">
            {totalSamples > 0 ? totalSamples : "—"}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-xs text-muted-foreground">Capacity</dt>
          <dd
            className={cn(
              "text-sm font-semibold tabular-nums",
              capacity.withinCapacity ? "text-foreground" : "text-destructive",
            )}
          >
            {capacity.withinCapacity ? "OK" : "Over"}
          </dd>
        </div>
      </dl>
    </div>
  );
}
