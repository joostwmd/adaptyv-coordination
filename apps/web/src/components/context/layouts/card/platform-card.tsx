import { Badge } from "@adaptyv-coordination/ui/components/badge";

import { MetaRow } from "../../primitives/meta-row";
import type { ExtractContextItem } from "../../types";

type PlatformCardProps = {
  item: ExtractContextItem<"platform">;
};

export function PlatformCard({ item }: PlatformCardProps) {
  return (
    <div className="flex flex-col gap-2">
      <Badge variant="secondary">{item.recordType}</Badge>
      <MetaRow label="Outcome" value={item.outcome} />
    </div>
  );
}
