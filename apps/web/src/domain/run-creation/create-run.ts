import { getPlateStock, getPlateType } from "@/domain/plate/catalog";
import type { PlateRequirement } from "@/domain/plate/types";
import { getDefaultParams } from "@/domain/task-template/param-schema";
import { getTaskTemplate } from "@/domain/task-template/catalog";
import type { TaskTemplate } from "@/domain/task-template/types";
import { mockInputSampleCount } from "@/domain/task/input-samples";
import { refreshAllTaskReadiness } from "@/domain/task/readiness";
import { nextTaskId } from "@/domain/task/scaffold";
import type { Task } from "@/types";
import type { ExperimentDetail, ExperimentRunSummary, ExperimentSummary } from "@/types/experiment";

import type { RunCreationDraft, RunTaskDraft } from "./draft";
import type { SelectableRunStep } from "./types";

function requiredPlatesFromDraft(
  draft: RunTaskDraft,
  template: TaskTemplate | undefined,
): PlateRequirement[] | undefined {
  const typeIds = template?.requiredPlateTypes ?? [];
  if (typeIds.length === 0) return undefined;

  const plates = typeIds.map((plateTypeId) => {
    const stockId = draft.plateAssignments[plateTypeId];
    const stock = stockId ? getPlateStock(stockId) : undefined;
    const plateType = getPlateType(plateTypeId);
    return {
      plateTypeId,
      plateTypeName: plateType?.name ?? "Unknown plate type",
      plateCode: stock?.code,
      materialStockId: stock?.materialStockId,
      isAssigned: Boolean(stockId),
      isRequired: true,
    };
  });

  return plates.length > 0 ? plates : undefined;
}

export function suggestDefaultRunName(experiment: ExperimentDetail): string {
  const revisionIndex =
    experiment.runs.length > 0
      ? Math.max(...experiment.runs.map((r) => r.revisionIndex)) + 1
      : 1;
  return `Revision ${revisionIndex}`;
}

export function buildNewRunSummary(
  experiment: ExperimentDetail,
  runName?: string,
): ExperimentRunSummary {
  const revisionIndex =
    experiment.runs.length > 0
      ? Math.max(...experiment.runs.map((r) => r.revisionIndex)) + 1
      : 1;

  const trimmedName = runName?.trim();
  const name = trimmedName || suggestDefaultRunName(experiment);

  return {
    id: `run-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
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

    const template = getTaskTemplate(step.taskTemplateId);
    const params = {
      ...(template ? getDefaultParams(template.paramSchema) : {}),
      ...step.step.paramOverrides,
      ...draft.params,
    };

    const id = nextTaskId();
    const task: Task = {
      id,
      taskTemplateId: step.taskTemplateId,
      name: `${step.templateName} — ${experiment.code}`,
      origin: "template",
      experimentId: experiment.id,
      runId: run.id,
      params,
      requiredPlates: requiredPlatesFromDraft(draft, template),
      inputSampleCount: mockInputSampleCount(step.taskTemplateId, id),
      status: "pending",
      dependsOn: previousId ? [previousId] : [],
      readiness: "ready",
      createdAt: new Date().toISOString(),
    };

    tasks.push(task);
    previousId = task.id;
  }

  return refreshAllTaskReadiness(tasks);
}

export type RunCreationResult = {
  run: ExperimentRunSummary;
  tasks: Task[];
};

export function buildRunCreationResult(
  experiment: ExperimentDetail,
  selectedSteps: SelectableRunStep[],
  drafts: RunCreationDraft,
  runName?: string,
): RunCreationResult | null {
  const { runs: _runs, ...summary } = experiment;
  const run = buildNewRunSummary(experiment, runName);
  const tasks = buildTasksFromRunCreation(summary, run, selectedSteps, drafts);
  if (tasks.length === 0) return null;
  return { run, tasks };
}
