import { getDefaultParams } from "@/domain/task-template/param-schema";
import { getTaskTemplate } from "@/domain/task-template/catalog";
import type { WorkflowTemplate } from "@/domain/workflow/types";
import type { ExperimentSummary } from "@/types";
import type { Task, TaskOrigin } from "./types";
import { refreshAllTaskReadiness } from "./readiness";

let taskIdCounter = 0;

export function resetTaskIdCounter(seed = 0): void {
  taskIdCounter = seed;
}

export function nextTaskId(prefix = "task"): string {
  taskIdCounter += 1;
  return `${prefix}-${taskIdCounter}`;
}

function buildTask(
  taskTemplateId: string,
  experimentIds: string[],
  origin: TaskOrigin,
  options: {
    params?: Record<string, unknown>;
    dependsOn?: string[];
    parentTaskId?: string;
    name?: string;
    id?: string;
  } = {},
): Task {
  const template = getTaskTemplate(taskTemplateId);
  const params = {
    ...(template ? getDefaultParams(template.paramSchema) : {}),
    ...options.params,
  };

  return {
    id: options.id ?? nextTaskId(),
    taskTemplateId,
    name: options.name ?? template?.name,
    origin,
    parentTaskId: options.parentTaskId,
    experimentIds,
    params,
    dependsOn: options.dependsOn ?? [],
    readiness: "ready",
    createdAt: new Date().toISOString(),
  };
}

export function scaffoldTasks(
  experiment: ExperimentSummary,
  workflow: WorkflowTemplate,
): Task[] {
  const tasks: Task[] = [];
  let previousId: string | undefined;

  for (const step of workflow.steps) {
    if (step.optional) {
      continue;
    }

    const task = buildTask(step.taskTemplateId, [experiment.id], "template", {
      params: step.paramOverrides,
      dependsOn: previousId ? [previousId] : [],
      name: `${getTaskTemplate(step.taskTemplateId)?.name ?? "Task"} — ${experiment.code}`,
    });
    tasks.push(task);
    previousId = task.id;
  }

  return refreshAllTaskReadiness(tasks);
}

export function createStandaloneTask(
  taskTemplateId: string,
  params: Record<string, unknown> = {},
  experimentIds: string[] = [],
): Task {
  const task = buildTask(taskTemplateId, experimentIds, "standalone", { params });
  return refreshAllTaskReadiness([task])[0]!;
}

export function createRerunTasks(sourceTasks: Task[]): Task[] {
  const reruns = sourceTasks.map((source) =>
    buildTask(source.taskTemplateId, [...source.experimentIds], "rerun", {
      params: { ...source.params },
      parentTaskId: source.id,
      dependsOn: [],
      name: `Rerun: ${source.name ?? source.taskTemplateId}`,
    }),
  );
  return refreshAllTaskReadiness(reruns);
}
