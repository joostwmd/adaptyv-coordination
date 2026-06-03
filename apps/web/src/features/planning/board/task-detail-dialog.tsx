import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@adaptyv-coordination/ui/components/dialog";
import { RelativeTimeCard } from "@adaptyv-coordination/ui/components/relative-time-card";

import { TaskContent } from "@/entities/task/task-content";
import { BLOCKED_REASON_LABEL } from "@/domain/blocked-reason";
import type { Task } from "@/domain/task/types";
import { useEnrichedTask } from "@/hooks/usePlanningTask";

type TaskDetailDialogProps = {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function TaskDetailDialog({ task, open, onOpenChange }: TaskDetailDialogProps) {
  const enriched = useEnrichedTask(task);

  const blockedLabel = task?.blockedReason
    ? BLOCKED_REASON_LABEL[task.blockedReason]
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {task && enriched ? (
        <DialogContent className="gap-0 sm:max-w-lg">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-base leading-snug">{enriched.title}</DialogTitle>
          </DialogHeader>

          <div className="flex max-h-[min(70vh,32rem)] flex-col gap-4 overflow-y-auto pr-1">
            <TaskContent task={task} variant="standalone" />

            {blockedLabel ? (
              <p className="text-sm text-destructive">{blockedLabel}</p>
            ) : null}

            {task.dependsOn.length > 0 ? (
              <p className="text-sm">
                <span className="text-muted-foreground">Runs after </span>
                <span className="font-mono text-xs">{task.dependsOn.join(", ")}</span>
              </p>
            ) : null}
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
