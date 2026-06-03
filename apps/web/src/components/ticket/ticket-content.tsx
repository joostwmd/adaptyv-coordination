import { Badge } from "@adaptyv-coordination/ui/components/badge";
import { cn } from "@adaptyv-coordination/ui/lib/utils";
import type { ReactNode } from "react";

import { ScheduledTime } from "@/components/planning/primitives/scheduled-time";
import { AssigneeRow } from "@/components/task/primitives/assignee-row";
import type { Ticket } from "@/domain/ticket/types";
import { useTicketView } from "@/hooks/useTicket";
import type { StaffMember } from "@/types";

type PreviewFieldProps = {
  label: string;
  value: ReactNode;
  className?: string;
};

function PreviewField({ label, value, className }: PreviewFieldProps) {
  return (
    <div className={cn("min-w-0", className)}>
      <dt className="text-[11px] leading-none text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-xs font-medium leading-snug text-foreground">{value}</dd>
    </div>
  );
}

const TICKET_STATUS_LABEL: Record<Ticket["status"], string> = {
  scheduled: "Scheduled",
  sent: "Sent",
};

type TicketContentProps = {
  ticket: Ticket;
  assignee?: StaffMember | null;
  variant?: "default" | "compact";
  className?: string;
};

export function TicketContent({
  ticket,
  assignee: assigneeProp,
  variant = "default",
  className,
}: TicketContentProps) {
  const view = useTicketView(ticket);
  if (!view) return null;

  const assignee = assigneeProp ?? view.assignee;
  const isCompact = variant === "compact";

  return (
    <article
      className={cn("flex flex-col gap-3", className)}
      aria-label={`Ticket ${ticket.id}`}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold leading-snug text-foreground">
            {view.templateLabel}
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {view.tasks.length} task{view.tasks.length === 1 ? "" : "s"} ·{" "}
            {view.experimentCount} experiment{view.experimentCount === 1 ? "" : "s"}
          </p>
        </div>
        <Badge variant="outline" className="shrink-0 text-[11px] font-normal">
          {TICKET_STATUS_LABEL[ticket.status]}
        </Badge>
      </header>

      {assignee ? <AssigneeRow assignee={assignee} /> : null}

      {!isCompact ? (
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-border/50 pt-3">
          <PreviewField
            label="Scheduled"
            value={
              <ScheduledTime scheduledDay={ticket.scheduledDay} display="date" className="text-xs" />
            }
            className="col-span-2"
          />
          <PreviewField label="Work unit" value={ticket.workUnitId} className="col-span-2" />
        </dl>
      ) : null}
    </article>
  );
}
