import { Badge } from "@adaptyv-coordination/ui/components/badge";

import { MetaRow } from "../../primitives/meta-row";
import type { ExtractContextItem } from "../../types";

type SupplierCardProps = {
  item: ExtractContextItem<"supplier">;
};

export function SupplierCard({ item }: SupplierCardProps) {
  const previewSpecs = item.specs.slice(0, 3);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary">{item.docType}</Badge>
        <span className="text-xs text-muted-foreground">{item.supplierName}</span>
      </div>
      <MetaRow label="Material" value={item.materialName} />
      <div className="flex flex-col gap-1 border border-border/60 p-2">
        {previewSpecs.map((spec) => (
          <MetaRow key={spec.label} label={spec.label} value={spec.value} />
        ))}
      </div>
    </div>
  );
}
