import { getCapacityStatus } from "@/domain/work-unit";
import type { Task } from "@/domain/task/types";
import type { WorkUnit } from "@/domain/work-unit/types";

export function getOverflowByUnitId(
  unscheduledUnits: WorkUnit[],
  tasks: Task[],
): Map<string, boolean> {
  const map = new Map<string, boolean>();

  for (const workUnit of unscheduledUnits) {
    const memberTasks = tasks.filter((task) => workUnit.taskIds.includes(task.id));
    map.set(workUnit.id, !getCapacityStatus(workUnit, memberTasks).withinCapacity);
  }

  return map;
}

export function isUnitOverflowing(
  workUnit: WorkUnit,
  tasks: Task[],
): boolean {
  const memberTasks = tasks.filter((task) => workUnit.taskIds.includes(task.id));
  return !getCapacityStatus(workUnit, memberTasks).withinCapacity;
}
