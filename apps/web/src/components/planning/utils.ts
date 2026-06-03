import { getTaskTemplate } from "@/domain/task-template/catalog";
import type { Task } from "@/domain/task/types";
import type { WorkUnit } from "@/domain/work-unit/types";
import type { ExperimentSummary } from "@/types";

export function getTaskTitle(task: Task): string {
  if (task.name) return task.name;
  const template = getTaskTemplate(task.taskTemplateId);
  return template?.name ?? "Task";
}

import { toDisplayScore } from "@/domain/priority";

export function formatPriorityScore(normalizedTotal: number): string {
  return toDisplayScore(normalizedTotal).toLocaleString();
}

export function countExperimentsInWorkUnit(
  tasks: Task[],
  experimentsById: Record<string, ExperimentSummary>,
): number {
  const ids = new Set<string>();
  for (const task of tasks) {
    if (task.experimentId && experimentsById[task.experimentId]) {
      ids.add(task.experimentId);
    }
  }
  return ids.size;
}

export function getWorkUnitTemplateLabel(workUnit: WorkUnit): string {
  const template = getTaskTemplate(workUnit.taskTemplateId);
  return template?.name ?? "Work unit";
}

export function getPrimaryExperimentId(task: Task): string | undefined {
  return task.experimentId;
}

export function getExperimentsInWorkUnit(
  tasks: Task[],
  experimentsById: Record<string, ExperimentSummary>,
): ExperimentSummary[] {
  const ids = new Set<string>();
  const experiments: ExperimentSummary[] = [];

  for (const task of tasks) {
    const expId = task.experimentId;
    if (!expId) continue;
    const experiment = experimentsById[expId];
    if (experiment && !ids.has(experiment.id)) {
      ids.add(experiment.id);
      experiments.push(experiment);
    }
  }

  return experiments.sort((a, b) => a.code.localeCompare(b.code));
}
