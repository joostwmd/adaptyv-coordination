import { useMemo } from "react";

import { getTicketsByPersonForDay } from "@/domain/planning/board-selectors";
import { getKanbanRoster } from "@/domain/planning/kanban-roster";
import { usePlanningBoardStore } from "@/stores/planning/usePlanningBoardStore";
import { usePrototypeStore } from "@/stores/usePrototypeStore";
import { getStaffHandle } from "@/types";

export function usePlanningDayBoard() {
  const tickets = usePlanningBoardStore((state) => state.tickets);
  const currentDay = usePlanningBoardStore((state) => state.currentDay);
  const staff = usePrototypeStore((state) => state.staff);

  return useMemo(() => {
    const kanbanRoster = getKanbanRoster(staff, getStaffHandle);
    const ticketsByPerson = getTicketsByPersonForDay(
      tickets,
      currentDay,
      kanbanRoster.map((member) => member.id),
    );

    return {
      currentDay,
      kanbanRoster,
      ticketsByPerson,
    };
  }, [tickets, currentDay, staff]);
}
