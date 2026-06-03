import { useMemo } from "react";

import {
  buildPlanningPriorityContext,
  scoreTask,
  type PriorityScore,
  type PriorityWeights,
} from "@/domain/priority";
import { getTaskTemplate } from "@/domain/task-template/catalog";
import type { Task } from "@/types";
import { usePlanningStore, usePlanningWeights } from "@/stores/usePlanningStore";
import { usePrototypeStore } from "@/stores/usePrototypeStore";
import type { ExperimentSummary } from "@/types";
import { getTaskTitle } from "@/components/planning/utils";

export type EnrichedPlanningTask = {
  task: Task;
  title: string;
  templateName: string;
  experiment: ExperimentSummary | null;
  priority: PriorityScore;
};

function toExperimentSummary(
  experiment: ReturnType<typeof usePrototypeStore.getState>["experiments"][0],
): ExperimentSummary | null {
  if (!experiment) return null;
  const { runs: _runs, ...summary } = experiment;
  return summary;
}

export function enrichTask(
  task: Task,
  experimentsById: Record<string, ExperimentSummary>,
  weights: PriorityWeights,
  referenceDate: string,
): EnrichedPlanningTask {
  const template = getTaskTemplate(task.taskTemplateId);
  const expId = task.experimentId;
  const experiment = expId ? (experimentsById[expId] ?? null) : null;
  const ctx = buildPlanningPriorityContext(task, experiment, referenceDate);

  return {
    task,
    title: getTaskTitle(task),
    templateName: template?.name ?? "Unknown type",
    experiment,
    priority: scoreTask(task, ctx, weights),
  };
}

export function useExperimentsById() {
  const experiments = usePrototypeStore((s) => s.experiments);
  return useMemo(() => {
    const map: Record<string, ExperimentSummary> = {};
    for (const e of experiments) {
      const summary = toExperimentSummary(e);
      if (summary) map[e.id] = summary;
    }
    return map;
  }, [experiments]);
}

export function useEnrichedTask(task: Task | null): EnrichedPlanningTask | null {
  const weights = usePlanningWeights();
  const referenceDate = usePlanningStore((s) => s.currentDay);
  const experimentsById = useExperimentsById();

  return useMemo(() => {
    if (!task) return null;
    return enrichTask(task, experimentsById, weights, referenceDate);
  }, [task, experimentsById, weights, referenceDate]);
}

export function useEnrichedTasks(tasks: Task[]): EnrichedPlanningTask[] {
  const weights = usePlanningWeights();
  const referenceDate = usePlanningStore((s) => s.currentDay);
  const experimentsById = useExperimentsById();

  return useMemo(
    () => tasks.map((t) => enrichTask(t, experimentsById, weights, referenceDate)),
    [tasks, experimentsById, weights, referenceDate],
  );
}

export function usePlanningTaskById(taskId: string | undefined) {
  const task = usePlanningStore((s) =>
    taskId ? s.tasks.find((t) => t.id === taskId) : undefined,
  );
  return useEnrichedTask(task ?? null);
}
