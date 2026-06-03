import { MetaRow } from "../../primitives/meta-row";
import type { ExtractContextItem } from "../../types";

type PaperDetailProps = {
  item: ExtractContextItem<"paper">;
};

export function PaperDetail({ item }: PaperDetailProps) {
  return (
    <div className="flex flex-col gap-4">
      <MetaRow label="Authors" value={item.authors} />
      <MetaRow label="Venue" value={`${item.venue} (${item.year})`} />

      <div>
        <p className="mb-1 text-xs font-medium text-muted-foreground">Abstract</p>
        <p className="text-xs/relaxed">{item.abstract}</p>
      </div>

      {item.takeaway ? (
        <div className="border border-border/60 bg-muted/30 p-3">
          <p className="mb-1 text-xs font-medium text-muted-foreground">Key takeaway</p>
          <p className="text-xs/relaxed">{item.takeaway}</p>
        </div>
      ) : null}
    </div>
  );
}
