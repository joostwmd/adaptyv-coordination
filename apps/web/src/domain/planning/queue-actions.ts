import type { PriorityWeights } from "@/domain/priority";
import type { Task } from "@/domain/task/types";
import { createWorkUnitFromTasks, suggestSplit } from "@/domain/work-unit";
import type { WorkUnit } from "@/domain/work-unit/types";
import type { ExperimentSummary } from "@/types";

export type QueuePreviewContext = {
  experimentsById: Record<string, ExperimentSummary>;
  weights: PriorityWeights;
  currentDay: string;
};

export type PoolGroupPreview = {
  suggestedUnit: WorkUnit;
  showSplitPreview: boolean;
  splitPrimaryUnit?: WorkUnit;
  splitSecondaryUnit?: WorkUnit;
};

export function previewPoolGroup(
  tasks: Task[],
  context: QueuePreviewContext,
): PoolGroupPreview {
  const suggestedUnit = createWorkUnitFromTasks(tasks);
  const split = suggestSplit(
    tasks,
    context.experimentsById,
    context.weights,
    context.currentDay,
  );
  const showSplitPreview = split.secondary.length > 0;

  return {
    suggestedUnit,
    showSplitPreview,
    splitPrimaryUnit: showSplitPreview
      ? createWorkUnitFromTasks(split.primary)
      : undefined,
    splitSecondaryUnit: showSplitPreview
      ? createWorkUnitFromTasks(split.secondary)
      : undefined,
  };
}

export function previewSoloUnit(task: Task): WorkUnit {
  return createWorkUnitFromTasks([task]);
}
