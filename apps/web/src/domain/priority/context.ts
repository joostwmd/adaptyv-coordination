import type { Task } from "@/domain/task/types";
import type { ExperimentSummary } from "@/types";

import type { TaskPriorityContext } from "./types";

export function computeDeadlineDays(
  dueDate: string | undefined,
  referenceDate: string,
): number | undefined {
  if (!dueDate) return undefined;

  const due = new Date(`${dueDate}T00:00:00`);
  const reference = new Date(`${referenceDate}T00:00:00`);
  const msPerDay = 1000 * 60 * 60 * 24;
  const days = Math.ceil((due.getTime() - reference.getTime()) / msPerDay);

  return Math.max(0, days);
}

export function resolveCustomerTier(experiment: ExperimentSummary | null): number {
  if (experiment?.client.tier !== undefined) {
    return Math.max(1, Math.min(5, experiment.client.tier));
  }
  return experiment?.category === "production" ? 4 : 2;
}

export function buildPlanningPriorityContext(
  task: Task,
  experiment: ExperimentSummary | null,
  referenceDate: string,
): TaskPriorityContext {
  return {
    experimentPriority: experiment?.priority ?? 0,
    experimentCategory: experiment?.category ?? "rd",
    customerTier: resolveCustomerTier(experiment),
    deadlineDays: computeDeadlineDays(experiment?.dueDate, referenceDate),
    createdAt: task.createdAt,
  };
}
