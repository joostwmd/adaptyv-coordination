import { TicketAssignmentRow } from "@/components/ticket/ticket-assignment-row";
import { TicketHoverCard } from "@/components/ticket/ticket-hover-card";
import { WorkUnitChip } from "@/components/work-unit/work-unit-chip";
import { WorkUnitHoverCard } from "@/components/work-unit/work-unit-hover-card";
import { useStaffMember } from "@/hooks/useStaff";
import { useTicketByWorkUnit } from "@/hooks/useTicket";
import { useWorkUnit } from "@/hooks/useWorkUnit";
import type { Task } from "@/types";

type TaskPlanningLinksProps = {
  task: Task;
  className?: string;
};

/** Work unit and ticket hover triggers for planning task surfaces. */
export function TaskPlanningLinks({ task, className }: TaskPlanningLinksProps) {
  const workUnit = useWorkUnit(task.workUnitId);
  const ticket = useTicketByWorkUnit(task.workUnitId);
  const { staffMember: ticketAssignee } = useStaffMember(ticket?.assigneeId ?? "");

  if (!workUnit && !ticket) return null;

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center gap-2">
        {workUnit ? (
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
        {ticket ? (
          <TicketHoverCard
            ticket={ticket}
            assignee={ticketAssignee}
            trigger={
              <button
                type="button"
                className="rounded-sm text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={(event) => event.stopPropagation()}
                onPointerDown={(event) => event.stopPropagation()}
              >
                <TicketAssignmentRow ticket={ticket} assignee={ticketAssignee} />
              </button>
            }
          />
        ) : null}
      </div>
    </div>
  );
}
