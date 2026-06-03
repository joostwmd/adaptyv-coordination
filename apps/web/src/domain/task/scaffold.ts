import { getDefaultParams } from "@/domain/task-template/param-schema";
import { getTaskTemplate } from "@/domain/task-template/catalog";
import { buildRequiredPlatesForTaskTemplate } from "@/domain/plate/requirements";
import { mockInputSampleCount } from "@/domain/task/input-samples";
import type { WorkflowTemplate } from "@/domain/workflow/types";
import type { ExperimentRunSummary, ExperimentSummary } from "@/types";
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

export function scaffoldTasks(
  experiment: ExperimentSummary,
  run: ExperimentRunSummary,
  workflow: WorkflowTemplate,
): Task[] {
  const tasks: Task[] = [];
  let previousId: string | undefined;

  for (const step of workflow.steps) {
    if (step.optional) {
      continue;
    }

    const task = buildTask(step.taskTemplateId, "template", {
      experimentId: experiment.id,
      runId: run.id,
      params: step.paramOverrides,
      dependsOn: previousId ? [previousId] : [],
      name: `${getTaskTemplate(step.taskTemplateId)?.name ?? "Task"} — ${experiment.code}`,
    });
    tasks.push(task);
    previousId = task.id;
  }

  return refreshAllTaskReadiness(tasks);
}

export type StandaloneTaskContext = {
  experimentId?: string;
  runId?: string;
};

export function createStandaloneTask(
  taskTemplateId: string,
  params: Record<string, unknown> = {},
  context: StandaloneTaskContext = {},
): Task {
  const task = buildTask(taskTemplateId, "standalone", {
    ...context,
    params,
  });
  return refreshAllTaskReadiness([task])[0]!;
}

export function primaryRunForExperiment(experiment: {
  runs: ExperimentRunSummary[];
}): ExperimentRunSummary | undefined {
  if (experiment.runs.length === 0) return undefined;
  return experiment.runs.reduce((latest, run) =>
    run.revisionIndex > latest.revisionIndex ? run : latest,
  );
}

export function createRerunTasks(sourceTasks: Task[]): Task[] {
  const reruns = sourceTasks.map((source) =>
    buildTask(source.taskTemplateId, "rerun", {
      experimentId: source.experimentId,
      runId: source.runId,
      params: { ...source.params },
      requiredPlates: source.requiredPlates?.map((p) => ({ ...p })),
      inputSampleCount: source.inputSampleCount,
      parentTaskId: source.id,
      dependsOn: [],
      name: `Rerun: ${source.name ?? source.taskTemplateId}`,
    }),
  );
  return refreshAllTaskReadiness(reruns);
}
