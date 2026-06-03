import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@adaptyv-coordination/ui/components/dialog";
import { RelativeTimeCard } from "@adaptyv-coordination/ui/components/relative-time-card";

import { ExperimentDetailDialog } from "@/components/experiment";
import { TaskPlanningLinks } from "@/components/task/task-planning-links";
import { TicketContent } from "@/components/ticket/ticket-content";
import { WorkUnitContent } from "@/components/work-unit/work-unit-content";
import { BLOCKED_REASON_LABEL } from "@/domain/blocked-reason";
import type { Task } from "@/domain/task/types";
import { useEnrichedTask } from "@/hooks/usePlanningTask";
import { useTicketView } from "@/hooks/useTicket";
import { useWorkUnitView } from "@/hooks/useWorkUnit";
import { usePlanningStore } from "@/stores/usePlanningStore";

import { ParameterSummary } from "./parameter-summary";
import { PriorityIndicator } from "./priority-indicator";
import { ReadinessBadge } from "./readiness-badge";
import { TaskTypeBadge } from "./task-type-badge";

type TaskDetailDialogProps = {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function TaskDetailDialog({ task, open, onOpenChange }: TaskDetailDialogProps) {
  const enriched = useEnrichedTask(task);
  const [experimentDialogOpen, setExperimentDialogOpen] = useState(false);
  const workUnit = usePlanningStore((s) =>
    task?.workUnitId ? s.workUnits.find((wu) => wu.id === task.workUnitId) : undefined,
  );
  const ticket = usePlanningStore((s) =>
    task?.workUnitId
      ? s.tickets.find((t) => t.workUnitId === task.workUnitId)
      : undefined,
  );
  const workUnitView = useWorkUnitView(workUnit ?? null);
  const ticketView = useTicketView(ticket ?? null);

  const experiment = enriched?.experiment;
  const showReadiness = task && task.readiness !== "batched";
  const blockedLabel = task?.blockedReason
    ? BLOCKED_REASON_LABEL[task.blockedReason]
    : null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        {task && enriched ? (
          <DialogContent className="gap-0 sm:max-w-lg">
            <DialogHeader className="space-y-2.5 pb-4">
              {(showReadiness || enriched.templateName) && (
                <div className="flex flex-wrap items-center gap-1.5 pr-6">
                  {showReadiness ? <ReadinessBadge readiness={task.readiness} /> : null}
                  <TaskTypeBadge label={enriched.templateName} />
                </div>
              )}
              <div className="flex items-start justify-between gap-2 pr-6">
                <div className="min-w-0 flex-1 space-y-1">
                  <DialogTitle className="text-base leading-snug">{enriched.title}</DialogTitle>
                  {experiment ? (
                    <button
                      type="button"
                      className="rounded-sm text-left font-mono text-xs text-muted-foreground underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                      onClick={() => setExperimentDialogOpen(true)}
                    >
                      {experiment.code}
                    </button>
                  ) : (
                    <p className="text-xs text-muted-foreground">No experiment</p>
                  )}
                </div>
                <PriorityIndicator priority={enriched.priority} />
              </div>
            </DialogHeader>

            <div className="flex max-h-[min(70vh,32rem)] flex-col gap-5 overflow-y-auto pr-1">
              <ParameterSummary task={task} variant="flat" />
              <TaskPlanningLinks task={task} />

              {blockedLabel ? (
                <p className="text-sm text-destructive">{blockedLabel}</p>
              ) : null}

              {task.dependsOn.length > 0 ? (
                <p className="text-sm">
                  <span className="text-muted-foreground">Runs after </span>
                  <span className="font-mono text-xs">{task.dependsOn.join(", ")}</span>
                </p>
              ) : null}

              {workUnitView && workUnit ? (
                <div className="border-t border-border/50 pt-4">
                  <p className="mb-2 text-xs font-medium text-muted-foreground">Work unit</p>
                  <WorkUnitContent workUnit={workUnit} />
                </div>
              ) : null}

              {ticketView && ticket ? (
                <div className="border-t border-border/50 pt-4">
                  <p className="mb-2 text-xs font-medium text-muted-foreground">Schedule</p>
                  <TicketContent ticket={ticket} assignee={ticketView.assignee} />
                </div>
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

      {experiment ? (
        <ExperimentDetailDialog
          experiment={experiment}
          open={experimentDialogOpen}
          onOpenChange={setExperimentDialogOpen}
        />
      ) : null}
    </>
  );
}
