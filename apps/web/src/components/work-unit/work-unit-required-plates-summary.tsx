import { Badge } from "@adaptyv-coordination/ui/components/badge";
import { cn } from "@adaptyv-coordination/ui/lib/utils";
import { Package } from "lucide-react";

import { aggregateRequiredPlatesForTasks } from "@/domain/plate/requirements";
import type { Task } from "@/types";

export type WorkUnitRequiredPlatesSummaryProps = {
  tasks: Task[];
  className?: string;
};

export function WorkUnitRequiredPlatesSummary({
  tasks,
  className,
}: WorkUnitRequiredPlatesSummaryProps) {
  const plates = aggregateRequiredPlatesForTasks(tasks);
  if (plates.length === 0) return null;

  const missingCount = plates.filter((p) => p.isRequired && !p.isAssigned).length;

  return (
    <section
      className={cn(
        "rounded-lg border border-dashed border-amber-500/35 bg-amber-500/[0.04] p-3",
        className,
      )}
      aria-label="Required inputs"
    >
      <div className="mb-2.5 flex flex-wrap items-center gap-2">
        <Package
          className="size-3.5 shrink-0 text-amber-700 dark:text-amber-500"
          aria-hidden
        />
        <h4 className="text-xs font-semibold uppercase tracking-wide text-foreground">
          Required inputs
        </h4>
        {missingCount > 0 ? (
          <Badge
            variant="outline"
            className="border-amber-500/50 text-[11px] font-normal text-amber-800 dark:text-amber-400"
          >
            {missingCount} missing
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="border-border/80 text-[11px] font-normal text-muted-foreground"
          >
            Ready
          </Badge>
        )}
      </div>
      <ul className="flex flex-col gap-1.5">
        {plates.map((plate) => (
          <li
            key={plate.plateTypeId}
            className="flex flex-wrap items-center gap-2 rounded-md border border-border/50 bg-background/70 px-2.5 py-2"
          >
            <span className="min-w-0 flex-1 text-sm font-medium leading-snug text-foreground">
              {plate.plateTypeName}
            </span>
            {plate.plateCode ? (
              <Badge variant="secondary" className="font-mono text-[11px] tabular-nums">
                {plate.plateCode}
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="border-amber-500/55 text-[11px] font-normal text-amber-800 dark:text-amber-400"
              >
                Not assigned
              </Badge>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
