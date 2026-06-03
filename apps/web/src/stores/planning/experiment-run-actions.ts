import { buildRunCreationResult } from "@/domain/run-creation/create-run";
import type { RunCreationDraft } from "@/domain/run-creation/draft";
import type { SelectableRunStep } from "@/domain/run-creation/types";
import { resolveWorkflowForExperiment } from "@/domain/run-creation/workflow-steps";
import {
  createStandaloneTask,
  refreshAllTaskReadiness,
  scaffoldTasks,
} from "@/domain/task";
import type { StandaloneTaskContext } from "@/domain/task/scaffold";
import { primaryRunForExperiment } from "@/domain/task/scaffold";
import type { Task } from "@/types";
import type { ExperimentRunSummary } from "@/types/experiment";

import type { usePrototypeStore } from "../usePrototypeStore";

type PrototypeState = ReturnType<typeof usePrototypeStore.getState>;

export type ExperimentRunActionsDeps = {
  getPrototypeState: () => PrototypeState;
  appendTasks: (tasks: Task[]) => void;
};

export function scaffoldFromExperiment(
  experimentId: string,
  deps: ExperimentRunActionsDeps,
): Task[] {
  const experiment = deps
    .getPrototypeState()
    .experiments.find((entry) => entry.id === experimentId);
  if (!experiment) return [];

  const { runs: _runs, ...summary } = experiment;
  const run = primaryRunForExperiment(experiment);
  if (!run) return [];

  const workflow = resolveWorkflowForExperiment(experiment);
  if (!workflow) return [];

  const newTasks = scaffoldTasks(summary, run, workflow);
  deps.appendTasks(newTasks);
  return newTasks;
}

export function createExperimentRunFromWizard(
  payload: {
    experimentId: string;
    runName: string;
    selectedSteps: SelectableRunStep[];
    drafts: RunCreationDraft;
  },
  deps: ExperimentRunActionsDeps,
): { run: ExperimentRunSummary; tasks: Task[] } | null {
  const experiment = deps
    .getPrototypeState()
    .experiments.find((entry) => entry.id === payload.experimentId);
  if (!experiment) return null;

  const result = buildRunCreationResult(
    experiment,
    payload.selectedSteps,
    payload.drafts,
    payload.runName,
  );
  if (!result) return null;

  const { run, tasks } = result;
  deps.getPrototypeState().addExperimentRunWithTasks(experiment.id, run, tasks);
  deps.appendTasks(tasks);
  return { run, tasks };
}

export function createStandalonePlanningTask(
  taskTemplateId: string,
  params: Record<string, unknown> = {},
  context: StandaloneTaskContext = {},
): Task {
  return createStandaloneTask(taskTemplateId, params, context);
}

export function syncTaskReadiness(tasks: Task[]): Task[] {
  return refreshAllTaskReadiness(tasks);
}
