import type { BlockedReason } from "@/domain/blocked-reason";
import { getUnscheduledWorkUnits as selectUnscheduledWorkUnits } from "@/domain/planning/board-selectors";
import { computeWorkUnitPriority } from "@/domain/work-unit";
import type { Ticket } from "@/domain/ticket/types";
import type { WorkUnit } from "@/domain/work-unit/types";
import type { Task } from "@/types";
import type { ExperimentSummary } from "@/types";
import type { PriorityWeights } from "@/domain/priority";

export function getTasksByExperiment(tasks: Task[], experimentId: string): Task[] {
  return tasks.filter((task) => task.experimentId === experimentId);
}

export function getTasksByWorkUnit(
  tasks: Task[],
  workUnits: WorkUnit[],
  workUnitId: string,
): Task[] {
  const workUnit = workUnits.find((unit) => unit.id === workUnitId);
  if (!workUnit) return [];
  return tasks.filter((task) => workUnit.taskIds.includes(task.id));
}

export function getTicketByWorkUnitId(
  tickets: Ticket[],
  workUnitId: string,
): Ticket | undefined {
  return tickets.find((ticket) => ticket.workUnitId === workUnitId);
}

export function getUnscheduledWorkUnits(workUnits: WorkUnit[], tickets: Ticket[]): WorkUnit[] {
  return selectUnscheduledWorkUnits(workUnits, tickets);
}

export function getWorkUnitPriority(
  workUnitId: string,
  state: {
    workUnits: WorkUnit[];
    tasks: Task[];
    weights: PriorityWeights;
    currentDay: string;
  },
  experimentsById: Record<string, ExperimentSummary>,
) {
  const workUnit = state.workUnits.find((unit) => unit.id === workUnitId);
  if (!workUnit) return null;

  return computeWorkUnitPriority(
    workUnit,
    state.tasks,
    experimentsById,
    state.weights,
    state.currentDay,
  );
}

export type { BlockedReason };
