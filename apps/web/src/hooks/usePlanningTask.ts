import { useMemo } from "react";

import {
  buildPlanningPriorityContext,
  scoreTask,
  type PriorityScore,
  type PriorityWeights,
} from "@/domain/priority";
import { getTaskTemplate } from "@/domain/task-template/catalog";
import type { Task } from "@/types";
import { usePlanningBoardStore } from "@/stores/planning/usePlanningBoardStore";
import { usePlanningWeights } from "@/stores/planning/usePlanningPreferencesStore";
import type { ExperimentSummary } from "@/types";
import { getTaskTitle } from "@/domain/planning/display";
import { useExperimentsById } from "@/hooks/useExperimentsById";

export type EnrichedPlanningTask = {
  task: Task;
  title: string;
  templateName: string;
  experiment: ExperimentSummary | null;
  priority: PriorityScore;
};

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

export function useEnrichedTask(task: Task | null): EnrichedPlanningTask | null {
  const weights = usePlanningWeights();
  const referenceDate = usePlanningBoardStore((state) => state.currentDay);
  const experimentsById = useExperimentsById();

  return useMemo(() => {
    if (!task) return null;
    return enrichTask(task, experimentsById, weights, referenceDate);
  }, [task, experimentsById, weights, referenceDate]);
}

export function useEnrichedTasks(tasks: Task[]): EnrichedPlanningTask[] {
  const weights = usePlanningWeights();
  const referenceDate = usePlanningBoardStore((state) => state.currentDay);
  const experimentsById = useExperimentsById();

  return useMemo(
    () => tasks.map((t) => enrichTask(t, experimentsById, weights, referenceDate)),
    [tasks, experimentsById, weights, referenceDate],
  );
}

export function usePlanningTaskById(taskId: string | undefined) {
  const task = usePlanningBoardStore((state) =>
    taskId ? state.tasks.find((entry) => entry.id === taskId) : undefined,
  );
  return useEnrichedTask(task ?? null);
}
