import { MetaRow } from "../../primitives/meta-row";
import type { ExtractContextItem } from "../../types";

type PaperCardProps = {
  item: ExtractContextItem<"paper">;
};

export function PaperCard({ item }: PaperCardProps) {
  return (
    <div className="flex flex-col gap-2">
      <MetaRow label="Authors" value={item.authors} />
      <MetaRow label="Venue" value={`${item.venue} (${item.year})`} />
      <p className="line-clamp-2 text-xs/relaxed text-muted-foreground">{item.abstract}</p>
    </div>
  );
}
