import {
  buildPlanningPriorityContext,
  scoreTask,
  type PriorityWeights,
} from "@/domain/priority";
import type { ExperimentSummary } from "@/types";
import type { Task } from "@/domain/task/types";
import type { WorkUnit, WorkUnitPriority } from "./types";

export function computeWorkUnitPriority(
  workUnit: WorkUnit,
  tasks: Task[],
  experimentsById: Record<string, ExperimentSummary>,
  weights: PriorityWeights,
  referenceDate: string,
): WorkUnitPriority | null {
  const memberTasks = tasks.filter((t) => workUnit.taskIds.includes(t.id));
  if (memberTasks.length === 0) return null;

  let bestScore = -1;
  let driverTaskId = memberTasks[0]!.id;

  for (const task of memberTasks) {
    const exp = experimentsById[task.experimentIds[0] ?? ""];
    const ctx = buildPlanningPriorityContext(task, exp ?? null, referenceDate);
    const { total } = scoreTask(task, ctx, weights);
    if (total > bestScore) {
      bestScore = total;
      driverTaskId = task.id;
    }
  }

  return { score: bestScore, driverTaskId };
}
