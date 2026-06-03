import { getTaskTemplate } from "@/domain/task-template/catalog";
import {
  getDisplayParamFields,
  paramFieldHasValue,
} from "@/domain/task-template/param-schema";
import type { TaskTemplate } from "@/domain/task-template/types";

import type { RunCreationDraft, RunTaskDraft } from "./draft";

export type TaskConfigStatus = "complete" | "incomplete";

export function getTaskConfigStatus(
  draft: RunTaskDraft | undefined,
  template: TaskTemplate | undefined,
): TaskConfigStatus {
  if (!draft || !template) return "incomplete";

  const missingParams = getDisplayParamFields(template.paramSchema).filter(
    (field) => field.required && !paramFieldHasValue(draft.params[field.name]),
  );

  const missingPlates = (template.requiredPlateTypes ?? []).filter(
    (plateTypeId) => !draft.plateAssignments[plateTypeId],
  );

  return missingParams.length === 0 && missingPlates.length === 0
    ? "complete"
    : "incomplete";
}

export function getTaskConfigStatusForStep(
  draft: RunTaskDraft | undefined,
  taskTemplateId: string,
): TaskConfigStatus {
  return getTaskConfigStatus(draft, getTaskTemplate(taskTemplateId));
}

export function isRunCreationDraftComplete(
  steps: { key: string; taskTemplateId: string }[],
  drafts: RunCreationDraft,
): boolean {
  return validateRunCreationPayload(steps, drafts).ok;
}

export type RunCreationValidationResult =
  | { ok: true }
  | { ok: false; incompleteStepKeys: string[] };

export function validateRunCreationPayload(
  steps: { key: string; taskTemplateId: string }[],
  drafts: RunCreationDraft,
): RunCreationValidationResult {
  const incompleteStepKeys = steps
    .filter(
      (step) =>
        getTaskConfigStatusForStep(drafts[step.key], step.taskTemplateId) ===
        "incomplete",
    )
    .map((step) => step.key);

  if (incompleteStepKeys.length > 0) {
    return { ok: false, incompleteStepKeys };
  }

  return { ok: true };
}

export function canProceedFromRunStepSelection(
  selectedKeyCount: number,
  runName: string,
): boolean {
  return selectedKeyCount > 0 && runName.trim().length > 0;
}
