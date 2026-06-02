import { Fragment } from "react";

import type { PriorityWeights } from "@/domain/priority/types";
import { PRIORITY_DIMENSION_META } from "@/domain/priority/meta";

type PriorityFormulaCompactProps = {
  weights: PriorityWeights;
};

export function PriorityFormulaCompact({ weights }: PriorityFormulaCompactProps) {
  return (
    <div className="min-w-0 flex-1 overflow-x-auto">
      <div className="flex min-w-max items-center gap-1 text-xs">
        <span className="font-medium text-foreground">Score</span>
        <span aria-hidden className="text-muted-foreground">
          =
        </span>
        {PRIORITY_DIMENSION_META.map((dimension, index) => (
          <Fragment key={dimension.key}>
            {index > 0 ? (
              <span aria-hidden className="text-muted-foreground">
                +
              </span>
            ) : null}
            <span className="inline-flex items-center gap-0.5 rounded border bg-background/80 px-1.5 py-0.5 tabular-nums">
              <span className="font-medium">{weights[dimension.key].toFixed(2)}</span>
              <span className="text-muted-foreground">×</span>
              <span className="text-muted-foreground">{dimension.shortLabel}</span>
            </span>
          </Fragment>
        ))}
        <span aria-hidden className="mx-1 text-muted-foreground">
          ·
        </span>
        <span className="whitespace-nowrap text-muted-foreground">
          badge = round(score × 1000)
        </span>
      </div>
    </div>
  );
}
