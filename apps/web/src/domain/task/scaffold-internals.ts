import { getDefaultParams } from "@/domain/task-template/param-schema";
import { getTaskTemplate } from "@/domain/task-template/catalog";
import { buildRequiredPlatesForTaskTemplate } from "@/domain/plate/requirements";
import { mockInputSampleCount } from "@/domain/task/input-samples";

import type { Task, TaskOrigin } from "./types";

let taskIdCounter = 0;

export function resetTaskIdCounter(seed = 0): void {
  taskIdCounter = seed;
}

export function nextTaskId(prefix = "task"): string {
  taskIdCounter += 1;
  return `${prefix}-${taskIdCounter}`;
}

export function buildTaskFromTemplate(
  taskTemplateId: string,
  origin: TaskOrigin,
  context: {
    experimentId?: string;
    runId?: string;
    params?: Record<string, unknown>;
    requiredPlates?: Task["requiredPlates"];
    inputSampleCount?: number;
    dependsOn?: string[];
    parentTaskId?: string;
    name?: string;
    id?: string;
    status?: Task["status"];
    readiness?: Task["readiness"];
  } = {},
): Task {
  const template = getTaskTemplate(taskTemplateId);
  const params = {
    ...(template ? getDefaultParams(template.paramSchema) : {}),
    ...context.params,
  };

  const requiredPlates =
    context.requiredPlates ??
    (template ? buildRequiredPlatesForTaskTemplate(template, taskTemplateId) : undefined);

  const id = context.id ?? nextTaskId();
  const inputSampleCount =
    context.inputSampleCount ?? mockInputSampleCount(taskTemplateId, id);

  return {
    id,
    taskTemplateId,
    name: context.name ?? template?.name,
    origin,
    parentTaskId: context.parentTaskId,
    experimentId: context.experimentId,
    runId: context.runId,
    params,
    requiredPlates:
      requiredPlates && requiredPlates.length > 0 ? requiredPlates : undefined,
    inputSampleCount,
    status: context.status ?? "pending",
    dependsOn: context.dependsOn ?? [],
    readiness: context.readiness ?? "ready",
    createdAt: new Date().toISOString(),
  };
}
