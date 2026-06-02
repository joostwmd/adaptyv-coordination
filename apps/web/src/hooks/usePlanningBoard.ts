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
import {
  sortClassifiedQueue,
  sortSiblingUnitGroups,
} from "@/domain/planning/board-sort";
import { getKanbanRoster } from "@/domain/planning/kanban-roster";
import { usePlanningStore } from "@/stores/usePlanningStore";
import { usePrototypeStore } from "@/stores/usePrototypeStore";
import type { ExperimentSummary } from "@/types";

export function usePlanningBoard() {
  const tasks = usePlanningStore((state) => state.tasks);
  const workUnits = usePlanningStore((state) => state.workUnits);
  const tickets = usePlanningStore((state) => state.tickets);
  const currentDay = usePlanningStore((state) => state.currentDay);
  const weights = usePlanningStore((state) => state.weights);
  const staff = usePrototypeStore((state) => state.staff);
  const experiments = usePrototypeStore((state) => state.experiments);

  const experimentsById = useMemo(
    () =>
      Object.fromEntries(
        experiments.map((experiment) => {
          const { runs: _runs, ...summary } = experiment;
          return [experiment.id, summary];
        }),
      ) as Record<string, ExperimentSummary>,
    [experiments],
  );

  return useMemo(() => {
    const unscheduledWorkUnits = getUnscheduledWorkUnits(workUnits, tickets);
    const queue = sortClassifiedQueue(
      classifyReadyTasks(tasks, unscheduledWorkUnits),
      experimentsById,
      weights,
    );
    const siblingGroups = sortSiblingUnitGroups(
      getSiblingUnitGroups(unscheduledWorkUnits),
      tasks,
      experimentsById,
      weights,
    );
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
  }, [tasks, workUnits, tickets, currentDay, weights, staff, experimentsById]);
}
