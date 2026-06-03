import { Badge } from "@adaptyv-coordination/ui/components/badge";
import { cn } from "@adaptyv-coordination/ui/lib/utils";
import { Package } from "lucide-react";

import { resolveRequiredPlatesForTask } from "@/domain/plate/requirements";
import type { Task } from "@/domain/task/types";

type RequiredPlatesSummaryProps = {
  task: Task;
  showHeading?: boolean;
  variant?: "card" | "flat";
  /** Override section title (default: Required plates). */
  heading?: string;
};

export function RequiredPlatesSummary({
  task,
  showHeading = true,
  variant = "card",
  heading = "Required inputs",
}: RequiredPlatesSummaryProps) {
  const plates = resolveRequiredPlatesForTask(task);
  if (plates.length === 0) return null;

  const isFlat = variant === "flat";
  const missingCount = plates.filter((p) => p.isRequired && !p.isAssigned).length;

  return (
    <div
      className={cn(
        !isFlat &&
          "rounded-lg border border-dashed border-amber-500/35 bg-amber-500/[0.04]",
        isFlat ? "" : showHeading ? "p-3" : "p-2.5",
      )}
    >
      {showHeading ? (
        <div className="mb-2.5 flex items-center gap-2">
          <Package
            className="size-3.5 shrink-0 text-amber-700 dark:text-amber-500"
            aria-hidden
          />
          <p className="text-xs font-semibold uppercase tracking-wide text-foreground">
            {heading}
          </p>
          {missingCount > 0 ? (
            <Badge variant="outline" className="border-amber-500/50 text-amber-700 dark:text-amber-400">
              {missingCount} missing
            </Badge>
          ) : null}
        </div>
      ) : null}
      <ul className="flex flex-col gap-2">
        {plates.map((plate) => (
          <li
            key={plate.plateTypeId}
            className="flex flex-wrap items-center gap-2 rounded-md border border-border/50 bg-background/60 px-2.5 py-2"
          >
            <span className="min-w-0 flex-1 text-sm font-medium text-foreground">
              {plate.plateTypeName}
            </span>
            {plate.plateCode ? (
              <Badge variant="secondary" className="font-mono text-xs tabular-nums">
                {plate.plateCode}
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="border-amber-500/60 text-amber-700 dark:text-amber-400"
              >
                Not assigned
              </Badge>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
