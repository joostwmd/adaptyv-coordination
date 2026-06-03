import { cn } from "@adaptyv-coordination/ui/lib/utils";

import { getWorkUnitTemplateLabel } from "@/domain/planning/display";
import type { WorkUnit } from "@/domain/work-unit/types";

type WorkUnitChipProps = {
  workUnit: WorkUnit;
  className?: string;
};

export function WorkUnitChip({ workUnit, className }: WorkUnitChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border border-dashed border-muted-foreground/40 bg-muted/40 px-2 py-0.5 text-[11px] font-medium text-muted-foreground hover:bg-muted/60",
        className,
      )}
    >
      {getWorkUnitTemplateLabel(workUnit)} · {workUnit.taskIds.length} tasks
    </span>
  );
}
