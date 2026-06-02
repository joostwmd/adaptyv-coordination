import { useMemo } from "react";

import type { PriorityScore } from "@/domain/priority";
import type { Task } from "@/domain/task/types";
import { computeWorkUnitPriority } from "@/domain/work-unit";
import type { WorkUnit } from "@/domain/work-unit/types";
import {
  countExperimentsInWorkUnit,
  getWorkUnitTemplateLabel,
} from "@/components/planning/utils";
import {
  useEnrichedTasks,
  useExperimentsById,
  type EnrichedPlanningTask,
} from "@/hooks/usePlanningTask";
import { usePlanningStore, usePlanningWeights } from "@/stores/usePlanningStore";

export type EnrichedWorkUnit = {
  workUnit: WorkUnit;
  tasks: Task[];
  enrichedTasks: EnrichedPlanningTask[];
  experimentCount: number;
  templateLabel: string;
  /** Driver task priority (work unit score = max of member tasks). */
  priority: PriorityScore | null;
  driverTaskTitle: string | null;
};

export function useWorkUnitView(workUnit: WorkUnit | null): EnrichedWorkUnit | null {
  const allTasks = usePlanningStore((s) => s.tasks);
  const experimentsById = useExperimentsById();
  const weights = usePlanningWeights();
  const getWorkUnitPriority = usePlanningStore((s) => s.getWorkUnitPriority);
  const referenceDate = usePlanningStore((s) => s.currentDay);

  const tasks = useMemo(() => {
    if (!workUnit) return [];
    return allTasks.filter((t) => workUnit.taskIds.includes(t.id));
  }, [allTasks, workUnit]);

  const enrichedTasks = useEnrichedTasks(tasks);

  return useMemo(() => {
    if (!workUnit) return null;

    const workUnitPriority =
      getWorkUnitPriority(workUnit.id) ??
      computeWorkUnitPriority(workUnit, tasks, experimentsById, weights, referenceDate);
    const driver = workUnitPriority
      ? enrichedTasks.find((e) => e.task.id === workUnitPriority.driverTaskId)
      : undefined;

    return {
      workUnit,
      tasks,
      enrichedTasks,
      experimentCount: countExperimentsInWorkUnit(tasks, experimentsById),
      templateLabel: getWorkUnitTemplateLabel(workUnit),
      priority: driver?.priority ?? null,
      driverTaskTitle: driver?.title ?? null,
    };
  }, [
    workUnit,
    tasks,
    enrichedTasks,
    experimentsById,
    weights,
    referenceDate,
    getWorkUnitPriority,
  ]);
}
