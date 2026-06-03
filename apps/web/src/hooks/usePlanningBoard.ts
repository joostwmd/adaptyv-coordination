import { useMemo } from "react";

import {
  classifyReadyTasks,
  getBlockedTasks,
  getRerunTasks,
  getSiblingUnitGroups,
  getTicketsByPersonForDay,
  getUnscheduledWorkUnits,
  getWaitingUpstreamTasks,
} from "@/domain/planning/board-selectors";
import { useExperimentsById } from "@/hooks/useExperimentsById";
import {
  sortClassifiedQueue,
  sortSiblingUnitGroups,
} from "@/domain/planning/board-sort";
import { getKanbanRoster } from "@/domain/planning/kanban-roster";
import { usePlanningBoardStore } from "@/stores/planning/usePlanningBoardStore";
import { usePlanningPreferencesStore } from "@/stores/planning/usePlanningPreferencesStore";
import { usePrototypeStore } from "@/stores/usePrototypeStore";
import { getStaffHandle } from "@/types";
export function usePlanningBoard() {
  const tasks = usePlanningBoardStore((state) => state.tasks);
  const workUnits = usePlanningBoardStore((state) => state.workUnits);
  const tickets = usePlanningBoardStore((state) => state.tickets);
  const currentDay = usePlanningBoardStore((state) => state.currentDay);
  const weights = usePlanningPreferencesStore((state) => state.weights);
  const staff = usePrototypeStore((state) => state.staff);
  const experimentsById = useExperimentsById();

  return useMemo(() => {
    const unscheduledWorkUnits = getUnscheduledWorkUnits(workUnits, tickets);
    const queue = sortClassifiedQueue(
      classifyReadyTasks(tasks, unscheduledWorkUnits),
      experimentsById,
      weights,
      currentDay,
    );
    const siblingGroups = sortSiblingUnitGroups(
      getSiblingUnitGroups(unscheduledWorkUnits),
      tasks,
      experimentsById,
      weights,
      currentDay,
    );
    const kanbanRoster = getKanbanRoster(staff, getStaffHandle);
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
      rerunTasks: getRerunTasks(tasks),
      kanbanRoster,
    };
  }, [tasks, workUnits, tickets, currentDay, weights, staff, experimentsById]);
}
