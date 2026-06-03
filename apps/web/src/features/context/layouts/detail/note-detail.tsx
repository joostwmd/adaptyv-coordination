import type { ExtractContextItem } from "../../types";

type NoteDetailProps = {
  item: ExtractContextItem<"note">;
};

export function NoteDetail({ item }: NoteDetailProps) {
  return (
    <div className="whitespace-pre-wrap text-xs/relaxed">{item.body}</div>
  );
}
