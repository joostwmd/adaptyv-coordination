import { Badge } from "@adaptyv-coordination/ui/components/badge";
import { cn } from "@adaptyv-coordination/ui/lib/utils";
import type { ReactNode } from "react";

import { WORK_UNIT_STATUS_CONFIG } from "@/components/planning/constants";
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
  const isCompact = variant === "compact";

  return (
    <header
      className={cn("flex items-start justify-between gap-3", className)}
    >
      <div className="min-w-0 flex-1 space-y-0.5">
        <h3
          className={cn(
            "font-semibold leading-snug text-foreground",
            isCompact ? "text-sm" : "text-base",
          )}
        >
          {view.templateLabel}
        </h3>
        <p className="font-mono text-[11px] text-muted-foreground">{workUnit.id}</p>
      </div>
      <div className="flex shrink-0 flex-wrap items-start justify-end gap-1.5">
        <Badge variant={statusConfig.variant} className="text-[11px] font-normal">
          {statusConfig.label}
        </Badge>
        {headerEnd}
      </div>
    </header>
  );
}
