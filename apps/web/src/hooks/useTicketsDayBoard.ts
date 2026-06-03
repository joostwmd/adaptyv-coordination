import { useMemo } from "react";

import type { KanbanRosterMember } from "@/domain/planning/kanban-roster";
import type { Ticket } from "@/domain/ticket/types";
import { usePlanningBoard } from "@/hooks/usePlanningBoard";

export type TicketsDayRow = {
  member: KanbanRosterMember;
  tickets: Ticket[];
};

export function useTicketsDayBoard() {
  const board = usePlanningBoard();

  const rows = useMemo(() => {
    const result: TicketsDayRow[] = [];

    for (const member of board.kanbanRoster) {
      const tickets = board.ticketsByPerson[member.id] ?? [];
      if (tickets.length > 0) {
        result.push({ member, tickets });
      }
    }

    return result;
  }, [board.kanbanRoster, board.ticketsByPerson]);

  return {
    currentDay: board.currentDay,
    rows,
  };
}
