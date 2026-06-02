import { useMemo } from "react";

import {
  classifyReadyTasks,
  getBlockedTasks,
  getFailedTasks,
  getSiblingUnitGroups,
  getTicketsByPersonForDay,
  getUnscheduledWorkUnits,
  getWaitingUpstreamTasks,
} from "@/domain/planning/board-selectors";
import { getKanbanRoster } from "@/domain/planning/kanban-roster";
import { usePlanningStore } from "@/stores/usePlanningStore";
import { usePrototypeStore } from "@/stores/usePrototypeStore";

export function usePlanningBoard() {
  const tasks = usePlanningStore((state) => state.tasks);
  const workUnits = usePlanningStore((state) => state.workUnits);
  const tickets = usePlanningStore((state) => state.tickets);
  const currentDay = usePlanningStore((state) => state.currentDay);
  const staff = usePrototypeStore((state) => state.staff);

  return useMemo(() => {
    const unscheduledWorkUnits = getUnscheduledWorkUnits(workUnits, tickets);
    const queue = classifyReadyTasks(tasks, unscheduledWorkUnits);
    const siblingGroups = getSiblingUnitGroups(unscheduledWorkUnits);
    const kanbanRoster = getKanbanRoster(staff);
    const ticketsByPerson = getTicketsByPersonForDay(
      tickets,
      currentDay,
      kanbanRoster.map((member) => member.id),
    );

    return {
      currentDay,
      queue,
      unscheduledWorkUnits,
      siblingGroups,
      ticketsByPerson,
      blockedTasks: getBlockedTasks(tasks),
      waitingTasks: getWaitingUpstreamTasks(tasks),
      failedTasks: getFailedTasks(tasks),
      kanbanRoster,
    };
  }, [tasks, workUnits, tickets, currentDay, staff]);
}
