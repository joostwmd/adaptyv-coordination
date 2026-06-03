import { Badge } from "@adaptyv-coordination/ui/components/badge";
import { cn } from "@adaptyv-coordination/ui/lib/utils";

import {
  getPriorityBand,
  toDisplayScore,
  type PriorityScore,
} from "@/domain/priority";

export const PRIORITY_BADGE_CLASS: Record<PriorityScore["band"], string> = {
  high: "border-red-500/40 bg-red-500/15 text-red-700 dark:text-red-300",
  medium: "border-amber-500/40 bg-amber-500/15 text-amber-800 dark:text-amber-300",
  low: "border-border bg-muted text-muted-foreground",
};

type PriorityBadgeProps = {
  displayScore: number;
  band: PriorityScore["band"];
  className?: string;
};

export function PriorityBadge({ displayScore, band, className }: PriorityBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn("tabular-nums font-semibold", PRIORITY_BADGE_CLASS[band], className)}
    >
      Priority {displayScore}
    </Badge>
  );
}

export function resolvePriorityDisplay(
  priority?: PriorityScore,
  normalized?: number,
): { displayScore: number; band: PriorityScore["band"] } | null {
  if (priority) {
    return { displayScore: priority.displayScore, band: priority.band };
  }
  if (normalized !== undefined && normalized !== null) {
    return { displayScore: toDisplayScore(normalized), band: getPriorityBand(normalized) };
  }
  return null;
}
