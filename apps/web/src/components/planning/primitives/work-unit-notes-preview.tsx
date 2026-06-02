import type { WorkUnitNote } from "@/domain/work-unit/types";

type WorkUnitNotesPreviewProps = {
  notes: WorkUnitNote[];
};

export function WorkUnitNotesPreview({ notes }: WorkUnitNotesPreviewProps) {
  if (notes.length === 0) {
    return <p className="text-sm text-muted-foreground">No notes yet</p>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {[...notes].reverse().map((note) => (
        <li key={note.id} className="text-sm/relaxed">
          <span className="font-medium text-foreground">{note.author.name}</span>
          <span className="text-muted-foreground"> · </span>
          <time className="text-xs text-muted-foreground" dateTime={note.createdAt}>
            {new Date(note.createdAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })}
          </time>
          <p className="mt-0.5 text-foreground">{note.body}</p>
        </li>
      ))}
    </ul>
  );
}
