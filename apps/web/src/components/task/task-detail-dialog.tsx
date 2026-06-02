import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@adaptyv-coordination/ui/components/dialog";

import type { Task } from "@/types";

import { AssigneeRow } from "./primitives/assignee-row";
import { ExperimentLink } from "./primitives/experiment-link";
import { ExperimentRunLink } from "./primitives/experiment-run-link";
import { NoteItem } from "./primitives/note-item";
import { StatusBadge } from "./primitives/status-badge";

type TaskDetailDialogProps = {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function TaskDetailDialog({ task, open, onOpenChange }: TaskDetailDialogProps) {
  if (!task) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-2 pr-6">
            <StatusBadge status={task.status} />
          </div>
          <DialogTitle>{task.title}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <AssigneeRow assignee={task.assignee} />
          <ExperimentRunLink run={task.run} experiment={task.experiment} />
          <ExperimentLink experiment={task.experiment} />

          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium text-muted-foreground">
              Notes ({task.notes.length})
            </p>
            <div className="flex max-h-64 flex-col gap-2 overflow-y-auto">
              {task.notes.map((note) => (
                <NoteItem key={note.id} note={note} />
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
