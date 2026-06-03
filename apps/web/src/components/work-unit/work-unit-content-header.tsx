import { cn } from "@adaptyv-coordination/ui/lib/utils";
import type { ReactNode } from "react";

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
      {headerEnd ? (
        <div className="flex shrink-0 items-start justify-end">{headerEnd}</div>
      ) : null}
    </header>
  );
}
