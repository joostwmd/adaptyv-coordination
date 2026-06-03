import type { ExtractContextItem } from "../../types";

type NoteCardProps = {
  item: ExtractContextItem<"note">;
};

export function NoteCard({ item }: NoteCardProps) {
  return (
    <p className="line-clamp-3 text-xs/relaxed text-muted-foreground">{item.bodyPreview}</p>
  );
}
