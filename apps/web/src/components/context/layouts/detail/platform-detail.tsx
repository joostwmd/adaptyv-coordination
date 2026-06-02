import { Badge } from "@adaptyv-coordination/ui/components/badge";

import { MetaRow } from "../../primitives/meta-row";
import type { ExtractContextItem } from "../../types";

type PlatformDetailProps = {
  item: ExtractContextItem<"platform">;
};

export function PlatformDetail({ item }: PlatformDetailProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary">{item.recordType}</Badge>
      </div>

      <MetaRow label="Outcome" value={item.outcome} />
      <MetaRow label="Owner" value={item.owner} />

      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">Key metrics</p>
        <div className="grid grid-cols-2 gap-2 border border-border/60 p-3">
          {item.metrics.map((metric) => (
            <div key={metric.label} className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">{metric.label}</span>
              <span className="text-sm font-medium">{metric.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
