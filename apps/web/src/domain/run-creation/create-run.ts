import { nextExperimentRunId } from "@/domain/experiment-run/ids";
import { defaultRunName, nextRevisionIndex } from "@/domain/experiment-run/revision";
import { buildTaskFromWorkflowStep } from "@/domain/task/build-from-step";
import { refreshAllTaskReadiness } from "@/domain/task/readiness";
import type { Task } from "@/types";
import type { ExperimentDetail, ExperimentRunSummary, ExperimentSummary } from "@/types/experiment";

import type { RunCreationDraft } from "./draft";
import type { SelectableRunStep } from "./types";
import { validateRunCreationPayload } from "./validation";

export function suggestDefaultRunName(experiment: ExperimentDetail): string {
  return defaultRunName(experiment);
}

export function buildNewRunSummary(
  experiment: ExperimentDetail,
  runName?: string,
): ExperimentRunSummary {
  const revisionIndex = nextRevisionIndex(experiment.runs);
  const trimmedName = runName?.trim();
  const name = trimmedName || defaultRunName(experiment);

  return {
    id: nextExperimentRunId(),
    name,
    revisionIndex,
    experimentId: experiment.id,
    status: "draft",
    createdAt: new Date().toISOString(),
    taskCount: 0,
    completedTaskCount: 0,
    failedTaskCount: 0,
  };
}

export function buildTasksFromRunCreation(
  experiment: ExperimentSummary,
  run: ExperimentRunSummary,
  selectedSteps: SelectableRunStep[],
  drafts: RunCreationDraft,
): Task[] {
  const ordered = [...selectedSteps].sort((a, b) => a.index - b.index);
  const tasks: Task[] = [];
  let previousId: string | undefined;

  for (const step of ordered) {
    const draft = drafts[step.key];
    if (!draft) continue;

    const task = buildTaskFromWorkflowStep({
      experiment,
      run,
      taskTemplateId: step.taskTemplateId,
      stepParamOverrides: step.step.paramOverrides,
      draftParams: draft.params,
      plateAssignments: draft.plateAssignments,
      dependsOn: previousId ? [previousId] : [],
      name: `${step.templateName} — ${experiment.code}`,
    });

    tasks.push(task);
    previousId = task.id;
  }

  return refreshAllTaskReadiness(tasks);
}

export type RunCreationBuildResult =
  | { ok: true; run: ExperimentRunSummary; tasks: Task[] }
  | { ok: false; reason: "incomplete_drafts"; incompleteStepKeys: string[] }
  | { ok: false; reason: "no_tasks" };

/** @deprecated Use RunCreationBuildResult */
export type RunCreationResult = Extract<RunCreationBuildResult, { ok: true }>;

export function buildRunCreationResult(
  experiment: ExperimentDetail,
  selectedSteps: SelectableRunStep[],
  drafts: RunCreationDraft,
  runName?: string,
): RunCreationBuildResult {
  const validation = validateRunCreationPayload(selectedSteps, drafts);
  if (!validation.ok) {
    return {
      ok: false,
      reason: "incomplete_drafts",
      incompleteStepKeys: validation.incompleteStepKeys,
    };
  }

  const { runs: _runs, ...summary } = experiment;
  const run = buildNewRunSummary(experiment, runName);
  const tasks = buildTasksFromRunCreation(summary, run, selectedSteps, drafts);
  if (tasks.length === 0) {
    return { ok: false, reason: "no_tasks" };
  }
  return { ok: true, run, tasks };
}
