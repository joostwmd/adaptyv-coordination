import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@adaptyv-coordination/ui/components/dialog";
import { RelativeTimeCard } from "@adaptyv-coordination/ui/components/relative-time-card";

import { useExperimentById } from "@/stores/usePrototypeStore";
import type { Task } from "@/types";
import { getTaskDisplayName } from "@/types/task";

import { TaskContent } from "./task-content";

type TaskDetailDialogProps = {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function TaskDetailDialog({ task, open, onOpenChange }: TaskDetailDialogProps) {
  const experiment = useExperimentById(task?.experimentId ?? "");
  const summary = experiment
    ? (() => {
        const { runs: _runs, ...rest } = experiment;
        return rest;
      })()
    : null;
  const run =
    experiment && task?.runId
      ? experiment.runs.find((entry) => entry.id === task.runId)
      : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {task ? (
        <DialogContent className="gap-0 sm:max-w-lg">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-base leading-snug">
              {getTaskDisplayName(task)}
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[min(70vh,32rem)] overflow-y-auto pr-1">
            <TaskContent task={task} experiment={summary} run={run} />
          </div>
          <footer className="mt-4 space-y-1 border-t border-border/50 pt-3 text-[11px] text-muted-foreground">
            <p className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
              <span>Added</span>
              <RelativeTimeCard
                date={new Date(task.createdAt)}
                variant="ghost"
                className="inline h-auto p-0 text-[11px] font-normal text-muted-foreground whitespace-nowrap"
                updateInterval={60_000}
              />
              <span aria-hidden>·</span>
              <span className="capitalize">{task.origin}</span>
            </p>
            <p className="font-mono text-[10px]">{task.id}</p>
          </footer>
        </DialogContent>
      ) : null}
    </Dialog>
  );
}
