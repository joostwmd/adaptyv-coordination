import {
  buildPlanningPriorityContext,
  scoreTask,
  type PriorityWeights,
} from "@/domain/priority";
import type { Task } from "@/domain/task/types";
import {
  computeWorkUnitPriority,
  createWorkUnitFromTasks,
} from "@/domain/work-unit";
import type { WorkUnit } from "@/domain/work-unit/types";
import type { ExperimentSummary } from "@/types";

import type { ClassifiedQueue, PoolGroup } from "./board-selectors";

function compareDescending(a: number, b: number): number {
  if (b !== a) return b - a;
  return 0;
}

export function computeTaskPriorityScore(
  task: Task,
  experimentsById: Record<string, ExperimentSummary>,
  weights: PriorityWeights,
  referenceDate: string,
): number {
  const experiment = experimentsById[task.experimentIds[0] ?? ""] ?? null;
  const ctx = buildPlanningPriorityContext(task, experiment, referenceDate);
  return scoreTask(task, ctx, weights).total;
}

export function computePoolGroupPriorityScore(
  group: PoolGroup,
  experimentsById: Record<string, ExperimentSummary>,
  weights: PriorityWeights,
  referenceDate: string,
): number {
  const workUnit = createWorkUnitFromTasks(group.tasks);
  return (
    computeWorkUnitPriority(
      workUnit,
      group.tasks,
      experimentsById,
      weights,
      referenceDate,
    )?.score ?? 0
  );
}

export function computeWorkUnitPriorityScore(
  workUnit: WorkUnit,
  tasks: Task[],
  experimentsById: Record<string, ExperimentSummary>,
  weights: PriorityWeights,
  referenceDate: string,
): number {
  return (
    computeWorkUnitPriority(
      workUnit,
      tasks,
      experimentsById,
      weights,
      referenceDate,
    )?.score ?? 0
  );
}

export function sortClassifiedQueue(
  queue: ClassifiedQueue,
  experimentsById: Record<string, ExperimentSummary>,
  weights: PriorityWeights,
  referenceDate: string,
): ClassifiedQueue {
  return {
    pool: [...queue.pool].sort(
      (a, b) =>
        compareDescending(
          computePoolGroupPriorityScore(a, experimentsById, weights, referenceDate),
          computePoolGroupPriorityScore(b, experimentsById, weights, referenceDate),
        ) || a.workUnitKey.localeCompare(b.workUnitKey),
    ),
    attach: [...queue.attach].sort(
      (a, b) =>
        compareDescending(
          computeTaskPriorityScore(a.task, experimentsById, weights, referenceDate),
          computeTaskPriorityScore(b.task, experimentsById, weights, referenceDate),
        ) || a.task.id.localeCompare(b.task.id),
    ),
    alone: [...queue.alone].sort(
      (a, b) =>
        compareDescending(
          computeTaskPriorityScore(a, experimentsById, weights, referenceDate),
          computeTaskPriorityScore(b, experimentsById, weights, referenceDate),
        ) || a.id.localeCompare(b.id),
    ),
  };
}

export function sortSiblingUnitGroups(
  groups: WorkUnit[][],
  tasks: Task[],
  experimentsById: Record<string, ExperimentSummary>,
  weights: PriorityWeights,
  referenceDate: string,
): WorkUnit[][] {
  const scoreUnit = (workUnit: WorkUnit) =>
    computeWorkUnitPriorityScore(
      workUnit,
      tasks,
      experimentsById,
      weights,
      referenceDate,
    );

  return [...groups]
    .map((group) =>
      [...group].sort(
        (a, b) =>
          compareDescending(scoreUnit(a), scoreUnit(b)) ||
          a.id.localeCompare(b.id),
      ),
    )
    .sort((a, b) => {
      const maxA = Math.max(0, ...a.map(scoreUnit));
      const maxB = Math.max(0, ...b.map(scoreUnit));
      const byScore = compareDescending(maxB, maxA);
      if (byScore !== 0) return byScore;
      const keyA = a[0]?.workUnitKey ?? a[0]?.id ?? "";
      const keyB = b[0]?.workUnitKey ?? b[0]?.id ?? "";
      return keyA.localeCompare(keyB);
    });
}
