import { cn } from "@adaptyv-coordination/ui/lib/utils";

import { ScheduledTime } from "@/shared/layout/scheduled-time";
import { StaffAvatar } from "@/shared/staff/staff-avatar";
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
        "flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/60 bg-muted/30 px-3 py-2.5",
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        {assignee ? (
          <>
            <StaffAvatar member={assignee} />
            <div className="min-w-0">
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                Assignee
              </p>
              <p className="truncate text-sm font-medium leading-snug text-foreground">
                {assignee.name}
              </p>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Unassigned</p>
        )}
      </div>
      <div className="shrink-0 text-right">
        <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          Scheduled
        </p>
        <ScheduledTime
          scheduledDay={ticket.scheduledDay}
          display="date"
          className="text-sm font-medium tabular-nums text-foreground"
        />
      </div>
    </div>
  );
}
