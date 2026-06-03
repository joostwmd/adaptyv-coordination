import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { cn } from "@adaptyv-coordination/ui/lib/utils";

import {
  ExperimentHoverCard,
  ExperimentRunHoverCard,
} from "@/components/experiment";
import { TicketAssignmentRow } from "@/components/ticket/ticket-assignment-row";
import { TicketDetailDialog } from "@/components/ticket/ticket-detail-dialog";
import { WorkUnitChip } from "@/components/work-unit/work-unit-chip";
import { WorkUnitHoverCard } from "@/components/work-unit/work-unit-hover-card";
import { useStaffMember } from "@/hooks/useStaff";
import { useTicketByWorkUnit } from "@/hooks/useTicket";
import { useWorkUnit } from "@/hooks/useWorkUnit";
import { useExperimentById } from "@/stores/usePrototypeStore";
import type { ExperimentRunSummary, ExperimentSummary, Task } from "@/types";

export type TaskReferenceKey = "experiment" | "run" | "workUnit" | "ticket";

export type TaskReferencesProps = {
  task: Task;
  experiment?: ExperimentSummary | null;
  run?: ExperimentRunSummary;
  hide?: TaskReferenceKey[];
  className?: string;
};

function isHidden(hide: TaskReferenceKey[] | undefined, key: TaskReferenceKey) {
  return hide?.includes(key) ?? false;
}

export function TaskReferences({
  task,
  experiment: experimentProp,
  run: runProp,
  hide,
  className,
}: TaskReferencesProps) {
  const [ticketDialogOpen, setTicketDialogOpen] = useState(false);

  const experimentFromStore = useExperimentById(task.experimentId ?? "");
  const summary =
    experimentProp ??
    (experimentFromStore
      ? (() => {
          const { runs: _runs, ...rest } = experimentFromStore;
          return rest;
        })()
      : null);

  const run =
    runProp ??
    (experimentFromStore && task.runId
      ? experimentFromStore.runs.find((entry) => entry.id === task.runId)
      : undefined);

  const workUnit = useWorkUnit(task.workUnitId);
  const ticket = useTicketByWorkUnit(task.workUnitId);
  const { staffMember: ticketAssignee } = useStaffMember(ticket?.assigneeId ?? "");

  const showExperiment = summary && !isHidden(hide, "experiment");
  const showRun = summary && run && !isHidden(hide, "run");
  const showWorkUnit = workUnit && !isHidden(hide, "workUnit");
  const showTicket = ticket && !isHidden(hide, "ticket");

  if (!showExperiment && !showRun && !showWorkUnit && !showTicket) {
    return null;
  }

  return (
    <>
      <div className={cn("flex flex-col gap-2", className)}>
        {showExperiment ? (
          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] text-muted-foreground">Experiment</span>
            <ExperimentHoverCard
              experiment={summary}
              trigger={
                <Link
                  to="/experiments/$experimentId"
                  params={{ experimentId: summary.id }}
                  className="w-fit rounded-sm text-left text-xs font-medium text-foreground underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={(event) => event.stopPropagation()}
                  onPointerDown={(event) => event.stopPropagation()}
                >
                  {summary.name}
                </Link>
              }
            />
          </div>
        ) : null}

        {showRun ? (
          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] text-muted-foreground">Run</span>
            <ExperimentRunHoverCard
              run={run}
              experiment={summary}
              trigger={
                <Link
                  to="/experiments/$experimentId"
                  params={{ experimentId: summary.id }}
                  className="w-fit rounded-sm text-left text-xs font-medium text-foreground underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={(event) => event.stopPropagation()}
                  onPointerDown={(event) => event.stopPropagation()}
                >
                  R{run.revisionIndex} · {run.name}
                </Link>
              }
            />
          </div>
        ) : null}

        {(showWorkUnit || showTicket) && (
          <div className="flex flex-wrap items-center gap-2">
            {showWorkUnit ? (
              <WorkUnitHoverCard
                workUnit={workUnit}
                trigger={
                  <button
                    type="button"
                    className="rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    onClick={(event) => event.stopPropagation()}
                    onPointerDown={(event) => event.stopPropagation()}
                  >
                    <WorkUnitChip workUnit={workUnit} />
                  </button>
                }
              />
            ) : null}
            {showTicket ? (
              <button
                type="button"
                className="rounded-sm text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={(event) => {
                  event.stopPropagation();
                  setTicketDialogOpen(true);
                }}
                onPointerDown={(event) => event.stopPropagation()}
              >
                <TicketAssignmentRow ticket={ticket} assignee={ticketAssignee} />
              </button>
            ) : null}
          </div>
        )}
      </div>

      {showTicket && ticket ? (
        <TicketDetailDialog
          ticket={ticket}
          assignee={ticketAssignee}
          open={ticketDialogOpen}
          onOpenChange={setTicketDialogOpen}
        />
      ) : null}
    </>
  );
}
