import { getDefaultParams } from "@/domain/task-template/param-schema";
import { getTaskTemplate } from "@/domain/task-template/catalog";

import type { SelectableRunStep } from "./types";

export type RunTaskDraft = {
  stepKey: string;
  params: Record<string, unknown>;
  /** plateTypeId → selected plate stock id */
  plateAssignments: Record<string, string | undefined>;
};

export type RunCreationDraft = Record<string, RunTaskDraft>;

export function buildInitialDrafts(steps: SelectableRunStep[]): RunCreationDraft {
  const drafts: RunCreationDraft = {};

  for (const step of steps) {
    const template = getTaskTemplate(step.taskTemplateId);
    const plateAssignments: Record<string, string | undefined> = {};
    for (const plateTypeId of template?.requiredPlateTypes ?? []) {
      plateAssignments[plateTypeId] = undefined;
    }

    drafts[step.key] = {
      stepKey: step.key,
      params: template ? getDefaultParams(template.paramSchema) : {},
      plateAssignments,
    };
  }

  return drafts;
}

export function updateTaskDraft(
  drafts: RunCreationDraft,
  stepKey: string,
  patch: Partial<Pick<RunTaskDraft, "params" | "plateAssignments">>,
): RunCreationDraft {
  const current = drafts[stepKey];
  if (!current) return drafts;

  return {
    ...drafts,
    [stepKey]: {
      ...current,
      params: patch.params ? { ...current.params, ...patch.params } : current.params,
      plateAssignments: patch.plateAssignments
        ? { ...current.plateAssignments, ...patch.plateAssignments }
        : current.plateAssignments,
    },
  };
}
