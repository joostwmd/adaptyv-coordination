import { Badge } from "@adaptyv-coordination/ui/components/badge";

import { MetaRow } from "../../primitives/meta-row";
import type { ExtractContextItem } from "../../types";

type SupplierDetailProps = {
  item: ExtractContextItem<"supplier">;
};

export function SupplierDetail({ item }: SupplierDetailProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary">{item.docType}</Badge>
      </div>

      <MetaRow label="Supplier" value={item.supplierName} />
      <MetaRow label="Material" value={item.materialName} />

      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">Specifications</p>
        <div className="flex flex-col gap-1 border border-border/60 p-3">
          {item.specs.map((spec) => (
            <MetaRow key={spec.label} label={spec.label} value={spec.value} />
          ))}
        </div>
      </div>
    </div>
  );
}
