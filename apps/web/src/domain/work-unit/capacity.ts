import { getTaskTemplate } from "@/domain/task-template/catalog";
import { getResourceDefinition } from "@/domain/resource/resources";
import type { Task } from "@/domain/task/types";
import type { AggregatedResources, CapacityStatus, WorkUnit } from "./types";
import {
  buildPlanningPriorityContext,
  scoreTask,
  type PriorityWeights,
} from "@/domain/priority";
import type { ExperimentSummary } from "@/types";

export function aggregateResources(tasks: Task[]): AggregatedResources {
  const totals: AggregatedResources = {};

  for (const task of tasks) {
    const template = getTaskTemplate(task.taskTemplateId);
    if (!template) continue;

    for (const req of template.resourceProfile) {
      const current = totals[req.resourceType] ?? 0;
      switch (req.scaling) {
        case "PER_TASK":
          totals[req.resourceType] = current + req.amount;
          break;
        case "PER_WORK_PACKAGE":
          totals[req.resourceType] = Math.max(current, req.amount);
          break;
        case "STEPPED": {
          const step = req.stepSize ?? 1;
          const units = Math.ceil(req.amount / step);
          totals[req.resourceType] = current + units;
          break;
        }
      }
    }
  }

  return totals;
}

function emptyWorkUnitStub(taskTemplateId: string): WorkUnit {
  return {
    id: "",
    taskTemplateId,
    workUnitKey: "",
    taskIds: [],
    status: "draft",
  };
}

export function getCapacityStatus(workUnit: WorkUnit, tasks: Task[]): CapacityStatus {
  const aggregated = aggregateResources(tasks);
  const overflows: CapacityStatus["overflows"] = [];

  for (const [resourceType, used] of Object.entries(aggregated)) {
    const def = getResourceDefinition(resourceType);
    if (!def) continue;
    if (used > def.capacity) {
      overflows.push({ resourceType, used, limit: def.capacity });
    }
  }

  return {
    withinCapacity: overflows.length === 0,
    overflows,
  };
}

export function computeFillRatio(workUnit: WorkUnit, tasks: Task[]): number {
  const status = getCapacityStatus(workUnit, tasks);
  if (status.overflows.length > 0) return 1;
  const aggregated = aggregateResources(tasks);
  const ratios: number[] = [];
  for (const [resourceType, used] of Object.entries(aggregated)) {
    const def = getResourceDefinition(resourceType);
    if (def && def.capacity > 0) {
      ratios.push(used / def.capacity);
    }
  }
  return ratios.length ? Math.max(...ratios) : 0;
}

export type SplitSuggestion = {
  primary: Task[];
  secondary: Task[];
  overflows: CapacityStatus["overflows"];
};

export function suggestSplit(
  tasks: Task[],
  experimentsById: Record<string, ExperimentSummary>,
  weights: PriorityWeights,
  referenceDate: string,
): SplitSuggestion {
  const status = getCapacityStatus(
    emptyWorkUnitStub(tasks[0]?.taskTemplateId ?? ""),
    tasks,
  );

  const scored = tasks.map((task) => {
    const exp = experimentsById[task.experimentIds[0] ?? ""];
    const ctx = buildPlanningPriorityContext(task, exp ?? null, referenceDate);
    return { task, score: scoreTask(task, ctx, weights).total };
  });

  scored.sort((a, b) => b.score - a.score);

  const primary: Task[] = [];
  const secondary: Task[] = [];

  for (const { task } of scored) {
    const candidate = [...primary, task];
    const candidateStatus = getCapacityStatus(
      emptyWorkUnitStub(task.taskTemplateId),
      candidate,
    );
    if (candidateStatus.withinCapacity) {
      primary.push(task);
    } else {
      secondary.push(task);
    }
  }

  return { primary, secondary, overflows: status.overflows };
}
