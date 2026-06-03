import { cn } from "@adaptyv-coordination/ui/lib/utils";

import { ScheduledTime } from "@/components/planning/primitives/scheduled-time";
import { StaffAvatar } from "@/components/task/primitives/staff-avatar";
import type { Ticket } from "@/domain/ticket/types";
import type { StaffMember } from "@/types";

type TicketAssignmentRowProps = {
  ticket: Ticket;
  assignee?: StaffMember | null;
  className?: string;
};

export function TicketAssignmentRow({
  ticket,
  assignee,
  className,
}: TicketAssignmentRowProps) {
  return (
    <div
      className={cn(
        "inline-flex flex-wrap items-center gap-2 rounded-md border border-border/60 bg-muted/30 px-2 py-1 text-xs",
        className,
      )}
    >
      {assignee ? (
        <>
          <StaffAvatar member={assignee} />
          <span className="font-medium text-foreground">{assignee.name}</span>
        </>
      ) : (
        <span className="text-muted-foreground">Unassigned</span>
      )}
      <span className="text-muted-foreground" aria-hidden>
        ·
      </span>
      <ScheduledTime
        scheduledDay={ticket.scheduledDay}
        display="date"
        className="text-muted-foreground"
      />
    </div>
  );
}
