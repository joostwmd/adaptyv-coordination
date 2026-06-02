import { useMemo } from "react";

import type { PriorityScore } from "@/domain/priority";
import type { Task } from "@/domain/task/types";
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
import { usePlanningStore } from "@/stores/usePlanningStore";
import { usePrototypeStore } from "@/stores/usePrototypeStore";
import type { StaffMember } from "@/types";

export type EnrichedWorkUnit = {
  workUnit: WorkUnit;
  tasks: Task[];
  enrichedTasks: EnrichedPlanningTask[];
  assignees: StaffMember[];
  experimentCount: number;
  templateLabel: string;
  /** Driver task priority (work unit score = max of member tasks). */
  priority: PriorityScore | null;
  driverTaskTitle: string | null;
};

export function useWorkUnitView(workUnit: WorkUnit | null): EnrichedWorkUnit | null {
  const allTasks = usePlanningStore((s) => s.tasks);
  const staff = usePrototypeStore((s) => s.staff);
  const experimentsById = useExperimentsById();
  const getWorkUnitPriority = usePlanningStore((s) => s.getWorkUnitPriority);

  const tasks = useMemo(() => {
    if (!workUnit) return [];
    return allTasks.filter((t) => workUnit.taskIds.includes(t.id));
  }, [allTasks, workUnit]);

  const enrichedTasks = useEnrichedTasks(tasks);

  return useMemo(() => {
    if (!workUnit) return null;

    const assignees = workUnit.assigneeIds
      .map((id) => staff.find((m) => m.id === id))
      .filter((m): m is StaffMember => m !== undefined);

    const priority = getWorkUnitPriority(workUnit.id);
    const driver = priority
      ? enrichedTasks.find((e) => e.task.id === priority.driverTaskId)
      : undefined;

    return {
      workUnit,
      tasks,
      enrichedTasks,
      assignees,
      experimentCount: countExperimentsInWorkUnit(tasks, experimentsById),
      templateLabel: getWorkUnitTemplateLabel(workUnit),
      priority: driver?.priority ?? null,
      driverTaskTitle: driver?.title ?? null,
    };
  }, [workUnit, tasks, enrichedTasks, staff, experimentsById, getWorkUnitPriority]);
}
