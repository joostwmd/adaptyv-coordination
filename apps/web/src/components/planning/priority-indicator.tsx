import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@adaptyv-coordination/ui/components/tooltip";
import { cn } from "@adaptyv-coordination/ui/lib/utils";
import { InfoIcon } from "lucide-react";
import type { KeyboardEvent, MouseEvent } from "react";

import {
  dimensionDisplayScore,
  PRIORITY_DISPLAY_MAX,
  sortBreakdownByDimensionScore,
  type PriorityScore,
} from "@/domain/priority";

import { PriorityBadge, resolvePriorityDisplay } from "./priority-badge";

type PriorityIndicatorProps = {
  /** Full score with breakdown for tooltip. */
  priority?: PriorityScore;
  /** Fallback when only normalized total is known (badge only, no breakdown). */
  normalized?: number;
  className?: string;
  /** Stop click propagation when nested in a clickable card. */
  stopPropagation?: boolean;
  context?: "task" | "workUnit";
};

function stopCardOpen(event: MouseEvent | KeyboardEvent) {
  event.stopPropagation();
}

export function PriorityIndicator({
  priority,
  normalized,
  className,
  stopPropagation = false,
  context = "task",
}: PriorityIndicatorProps) {
  const display = resolvePriorityDisplay(priority, normalized);
  if (!display) return null;

  const sortedBreakdown = priority
    ? sortBreakdownByDimensionScore(priority.breakdown)
    : [];

  const handlePointer = stopPropagation ? stopCardOpen : undefined;

  return (
    <div className={cn("inline-flex items-center gap-1", className)}>
      <PriorityBadge displayScore={display.displayScore} band={display.band} />

      <Tooltip>
        <TooltipTrigger
          className="inline-flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted/60 hover:text-foreground"
          onClick={handlePointer}
          onKeyDown={handlePointer}
          aria-label="Priority breakdown"
        >
          <InfoIcon className="size-3.5" />
        </TooltipTrigger>
        <TooltipContent
          side="top"
          align="end"
          className="max-w-xs flex-col items-stretch gap-2 p-3 text-left"
        >
          <p className="font-medium">
            Score {display.displayScore} / {PRIORITY_DISPLAY_MAX}
          </p>
          {priority ? (
            <>
              <p className="text-[11px] text-background/70">
                {context === "workUnit"
                  ? `Factors from the highest-priority task in this work unit (0–${PRIORITY_DISPLAY_MAX} each), strongest first.`
                  : `Factors sorted strongest first (0–${PRIORITY_DISPLAY_MAX} each).`}
              </p>
              <ul className="flex flex-col gap-1">
                {sortedBreakdown.map((entry) => {
                  const dimScore = dimensionDisplayScore(entry.raw);
                  if (entry.dimension === "rerunBoost" && dimScore === 0) {
                    return null;
                  }
                  return (
                    <li
                      key={entry.dimension}
                      className="flex items-center justify-between gap-3 text-[11px]"
                    >
                      <span className="truncate">{entry.label}</span>
                      <span className="shrink-0 tabular-nums font-medium">{dimScore}</span>
                    </li>
                  );
                })}
              </ul>
            </>
          ) : (
            <p className="text-[11px] text-background/70">
              Open a task in this work unit for the full factor breakdown.
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
