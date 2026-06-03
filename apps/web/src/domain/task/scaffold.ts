import type { WorkflowTemplate } from "@/domain/workflow/types";
import type { ExperimentRunSummary, ExperimentSummary } from "@/types";

import { buildTaskFromWorkflowStep } from "./build-from-step";
import { buildTaskFromTemplate, nextTaskId, resetTaskIdCounter } from "./scaffold-internals";
import type { Task } from "./types";
import { refreshAllTaskReadiness } from "./readiness";

export { nextTaskId, resetTaskIdCounter, buildTaskFromTemplate } from "./scaffold-internals";
export { buildTaskFromWorkflowStep } from "./build-from-step";

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

    const task = buildTaskFromWorkflowStep({
      experiment,
      run,
      taskTemplateId: step.taskTemplateId,
      stepParamOverrides: step.paramOverrides,
      dependsOn: previousId ? [previousId] : [],
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
  const task = buildTaskFromTemplate(taskTemplateId, "standalone", {
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
    buildTaskFromTemplate(source.taskTemplateId, "rerun", {
      experimentId: source.experimentId,
      runId: source.runId,
      params: { ...source.params },
      requiredPlates: source.requiredPlates?.map((plate) => ({ ...plate })),
      inputSampleCount: source.inputSampleCount,
      parentTaskId: source.id,
      dependsOn: [],
      name: `Rerun: ${source.name ?? source.taskTemplateId}`,
    }),
  );
  return refreshAllTaskReadiness(reruns);
}
