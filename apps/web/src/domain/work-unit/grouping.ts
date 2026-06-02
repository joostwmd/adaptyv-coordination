import { pickBatchableParams } from "@/domain/task-template/param-schema";
import { getTaskTemplate } from "@/domain/task-template/catalog";
import type { Task } from "@/domain/task/types";
import type { WorkUnit } from "./types";

let workUnitIdCounter = 0;

export function resetWorkUnitIdCounter(seed = 0): void {
  workUnitIdCounter = seed;
}

export function nextWorkUnitId(prefix = "work-unit"): string {
  workUnitIdCounter += 1;
  return `${prefix}-${workUnitIdCounter}`;
}

export function computeWorkUnitKey(task: Task): string {
  const template = getTaskTemplate(task.taskTemplateId);
  const batchParams = template
    ? pickBatchableParams(task.params, template.batchKeyFields)
    : {};
  return JSON.stringify({
    taskTemplateId: task.taskTemplateId,
    plateTypeId: template?.plateTypeId ?? null,
    params: batchParams,
  });
}

export function groupTasksByWorkUnitKey(tasks: Task[]): Map<string, Task[]> {
  const groups = new Map<string, Task[]>();
  for (const task of tasks) {
    if (task.readiness !== "ready") continue;
    const key = computeWorkUnitKey(task);
    const list = groups.get(key) ?? [];
    list.push(task);
    groups.set(key, list);
  }
  return groups;
}

export function createWorkUnitFromTasks(
  tasks: Task[],
  options: { id?: string; status?: WorkUnit["status"] } = {},
): WorkUnit {
  if (tasks.length === 0) {
    throw new Error("Cannot create work unit from empty task list");
  }
  const key = computeWorkUnitKey(tasks[0]!);
  return {
    id: options.id ?? nextWorkUnitId(),
    taskTemplateId: tasks[0]!.taskTemplateId,
    workUnitKey: key,
    taskIds: tasks.map((t) => t.id),
    status: options.status ?? "draft",
  };
}

export function groupIntoDraftWorkUnits(tasks: Task[]): WorkUnit[] {
  const groups = groupTasksByWorkUnitKey(tasks);
  return [...groups.values()].map((group) => createWorkUnitFromTasks(group));
}
