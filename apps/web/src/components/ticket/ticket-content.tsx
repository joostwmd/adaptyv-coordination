import { cn } from "@adaptyv-coordination/ui/lib/utils";
import type { ReactNode } from "react";

import { ScheduledTime } from "@/components/planning/primitives/scheduled-time";
import { CollapsibleTaskList } from "@/components/task/collapsible-task-list";
import type { TaskReferenceKey } from "@/components/task/task-references";
import { WorkUnitContentHeader } from "@/components/work-unit/work-unit-content-header";
import { WorkUnitMetadataRow } from "@/components/work-unit/work-unit-metadata-row";
import { WorkUnitParameterSummary } from "@/components/work-unit/work-unit-parameter-summary";
import { WorkUnitRequiredPlatesSummary } from "@/components/work-unit/work-unit-required-plates-summary";
import type { Ticket } from "@/domain/ticket/types";
import { useTicketView } from "@/hooks/useTicket";
import { useWorkUnit } from "@/hooks/useWorkUnit";
import { useWorkUnitView } from "@/hooks/useWorkUnit";
import type { StaffMember, Task } from "@/types";

import { TicketAssignmentRow } from "./ticket-assignment-row";

export type TicketContentProps = {
  ticket: Ticket;
  assignee?: StaffMember | null;
  showTasks?: boolean;
  defaultTasksOpen?: boolean;
  renderTask?: (task: Task) => ReactNode;
  taskListHide?: TaskReferenceKey[];
  onTaskOpen?: (task: Task) => void;
  headerEnd?: ReactNode;
  className?: string;
};

export function TicketContent({
  ticket,
  assignee: assigneeProp,
  showTasks = false,
  defaultTasksOpen = false,
  renderTask,
  taskListHide = ["workUnit", "ticket"],
  onTaskOpen,
  headerEnd,
  className,
}: TicketContentProps) {
  const view = useTicketView(ticket);
  const workUnit = useWorkUnit(ticket.workUnitId);
  const workUnitView = useWorkUnitView(workUnit);

  if (!view) return null;

  const assignee = assigneeProp ?? view.assignee;

  return (
    <article
      className={cn("flex flex-col gap-3", className)}
      aria-label={`Ticket ${ticket.id}`}
    >
      {workUnit && workUnitView ? (
        <>
          <WorkUnitContentHeader
            workUnit={workUnit}
            view={workUnitView}
            variant="default"
            headerEnd={headerEnd}
          />
          <WorkUnitMetadataRow workUnit={workUnit} view={workUnitView} />
          <div className="flex flex-col gap-3">
            <WorkUnitParameterSummary workUnit={workUnit} tasks={workUnitView.tasks} />
            <WorkUnitRequiredPlatesSummary tasks={workUnitView.tasks} />
          </div>
        </>
      ) : null}

      <TicketAssignmentRow ticket={ticket} assignee={assignee} />

      {showTasks ? (
        <CollapsibleTaskList
          tasks={view.tasks}
          renderTask={renderTask}
          hide={taskListHide}
          defaultOpen={defaultTasksOpen}
          onTaskOpen={onTaskOpen}
        />
      ) : null}
    </article>
  );
}
