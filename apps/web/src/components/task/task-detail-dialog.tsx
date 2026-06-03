import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@adaptyv-coordination/ui/components/dialog";

import { ExperimentDetailDialog } from "@/components/experiment";
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
  const [experimentDialogOpen, setExperimentDialogOpen] = useState(false);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        {task ? (
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{getTaskDisplayName(task)}</DialogTitle>
            </DialogHeader>
            <TaskContent
              task={task}
              experiment={summary}
              showPlanningLinks
              showExperiment
              showRun
            />
            {summary ? (
              <button
                type="button"
                className="text-xs font-medium text-primary underline-offset-4 hover:underline"
                onClick={() => setExperimentDialogOpen(true)}
              >
                View experiment details
              </button>
            ) : null}
          </DialogContent>
        ) : null}
      </Dialog>
      {summary ? (
        <ExperimentDetailDialog
          experiment={summary}
          open={experimentDialogOpen}
          onOpenChange={setExperimentDialogOpen}
        />
      ) : null}
    </>
  );
}
