import { Badge } from "@adaptyv-coordination/ui/components/badge";

import type { KanbanRosterMember } from "@/domain/planning/kanban-roster";
import type { Ticket } from "@/domain/ticket/types";

import { TicketExecutionCard } from "./ticket-execution-card";

type TicketsStaffRowProps = {
  member: KanbanRosterMember;
  tickets: Ticket[];
};

export function TicketsStaffRow({ member, tickets }: TicketsStaffRowProps) {
  return (
    <section className="flex flex-col gap-2 border-b border-border/60 py-3 last:border-b-0">
      <div className="flex shrink-0 items-center justify-between gap-3 px-1">
        <p className="truncate text-lg font-semibold tracking-tight">{member.name}</p>
        <Badge variant="secondary" className="shrink-0 text-xs">
          {tickets.length} {tickets.length === 1 ? "ticket" : "tickets"}
        </Badge>
      </div>
      <div className="min-w-0 overflow-x-auto pb-1">
        <div className="flex w-max gap-3 px-1">
          {tickets.map((ticket) => (
            <TicketExecutionCard key={ticket.id} ticket={ticket} />
          ))}
        </div>
      </div>
    </section>
  );
}
