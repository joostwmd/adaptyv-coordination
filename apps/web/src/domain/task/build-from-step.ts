import { requiredPlatesFromDraft } from "@/domain/plate/from-draft";
import { getTaskTemplate } from "@/domain/task-template/catalog";
import type { ExperimentRunSummary, ExperimentSummary } from "@/types";

import { buildTaskFromTemplate } from "./scaffold-internals";
import type { Task } from "./types";

export type BuildTaskFromWorkflowStepOptions = {
  experiment: ExperimentSummary;
  run: ExperimentRunSummary;
  taskTemplateId: string;
  stepParamOverrides?: Record<string, unknown>;
  draftParams?: Record<string, unknown>;
  plateAssignments?: Record<string, string | undefined>;
  dependsOn?: string[];
  name?: string;
};

export function buildTaskFromWorkflowStep(
  options: BuildTaskFromWorkflowStepOptions,
): Task {
  const template = getTaskTemplate(options.taskTemplateId);
  const params = {
    ...options.stepParamOverrides,
    ...options.draftParams,
  };

  const requiredPlates =
    options.plateAssignments !== undefined
      ? requiredPlatesFromDraft(options.plateAssignments, template)
      : undefined;

  return buildTaskFromTemplate(options.taskTemplateId, "template", {
    experimentId: options.experiment.id,
    runId: options.run.id,
    params,
    requiredPlates,
    dependsOn: options.dependsOn,
    name:
      options.name ??
      `${template?.name ?? "Task"} — ${options.experiment.code}`,
  });
}
