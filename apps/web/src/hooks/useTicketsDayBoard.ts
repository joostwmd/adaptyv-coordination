import { useMemo } from "react";

import type { KanbanRosterMember } from "@/domain/planning/kanban-roster";
import type { Ticket } from "@/domain/ticket/types";
import { usePlanningDayBoard } from "@/hooks/usePlanningDayBoard";

export type TicketsDayRow = {
  member: KanbanRosterMember;
  tickets: Ticket[];
};

export function useTicketsDayBoard() {
  const { currentDay, kanbanRoster, ticketsByPerson } = usePlanningDayBoard();

  const rows = useMemo(() => {
    const result: TicketsDayRow[] = [];

    for (const member of kanbanRoster) {
      const tickets = ticketsByPerson[member.id] ?? [];
      if (tickets.length > 0) {
        result.push({ member, tickets });
      }
    }

    return result;
  }, [kanbanRoster, ticketsByPerson]);

  return {
    currentDay,
    rows,
  };
}
