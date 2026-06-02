import type { TaskNote } from "@/types";

type NotesThreadPreviewProps = {
  notes: TaskNote[];
};

export function NotesThreadPreview({ notes }: NotesThreadPreviewProps) {
  if (notes.length === 0) {
    return <p className="text-xs text-muted-foreground">No notes yet</p>;
  }

  const latest = notes[notes.length - 1]!;
  const remaining = notes.length - 1;

  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs font-medium text-muted-foreground">Notes</p>
      <p className="line-clamp-2 text-xs/relaxed">
        <span className="font-medium">{latest.author.name}:</span> {latest.body}
      </p>
      {remaining > 0 ? (
        <p className="text-xs text-muted-foreground">+ {remaining} more note{remaining === 1 ? "" : "s"}</p>
      ) : null}
    </div>
  );
}
