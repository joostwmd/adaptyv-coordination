import { StaffAvatar } from "./staff-avatar";
import type { TaskNote } from "@/types";

type NoteItemProps = {
  note: TaskNote;
};

function formatNoteDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function NoteItem({ note }: NoteItemProps) {
  return (
    <div className="flex gap-2 border border-border/60 p-2">
      <StaffAvatar member={note.author} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0">
          <span className="text-xs font-medium">{note.author.name}</span>
          <span className="text-xs text-muted-foreground">{formatNoteDate(note.createdAt)}</span>
        </div>
        <p className="mt-1 text-xs/relaxed">{note.body}</p>
      </div>
    </div>
  );
}
