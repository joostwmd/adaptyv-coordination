import { describe, expect, it } from "vitest";

import { getTaskTemplate } from "@/domain/task-template/catalog";
import { getDefaultParams, paramFieldHasValue } from "@/domain/task-template/param-schema";
import { buildInitialDrafts, updateTaskDraft } from "@/domain/run-creation/draft";
import type { RunTaskDraft } from "@/domain/run-creation/draft";
import {
  canProceedFromRunStepSelection,
  getTaskConfigStatus,
  getTaskConfigStatusForStep,
  isRunCreationDraftComplete,
} from "@/domain/run-creation/validation";
import { buildSelectableRunSteps, resolveWorkflowForExperiment } from "@/domain/run-creation/workflow-steps";
import { seedExperiments } from "@/test/fixtures";

describe("run-creation validation", () => {
  const experiment = seedExperiments[0]!;
  const workflow = resolveWorkflowForExperiment(experiment);
  const steps = workflow ? buildSelectableRunSteps(workflow).slice(0, 2) : [];

  it("returns incomplete when draft or template is missing", () => {
    expect(getTaskConfigStatus(undefined, undefined)).toBe("incomplete");

    if (steps.length === 0) return;

    const step = steps[0]!;
    const template = getTaskTemplate(step.taskTemplateId);
    const draft = buildInitialDrafts([step])[step.key];

    expect(getTaskConfigStatus(undefined, template)).toBe("incomplete");
    expect(getTaskConfigStatus(draft, undefined)).toBe("incomplete");
  });

  it("marks incomplete drafts when required plates are unassigned", () => {
    if (steps.length === 0) return;

    const drafts = buildInitialDrafts(steps);
    const step = steps[0]!;

    expect(getTaskConfigStatusForStep(drafts[step.key], step.taskTemplateId)).toBe(
      "incomplete",
    );
    expect(isRunCreationDraftComplete(steps, drafts)).toBe(false);
  });

  it("marks incomplete when required params are unset even if plates are assigned", () => {
    const template = getTaskTemplate("3e7749a4-d7b7-44a8-b1f3-e2e61dbba64c");
    if (!template) return;

    const plateTypeIds = template.requiredPlateTypes ?? [];
    const draft: RunTaskDraft = {
      stepKey: "expression-run",
      params: {
        ...getDefaultParams(template.paramSchema),
        expression_temperature: null,
      },
      plateAssignments: Object.fromEntries(
        plateTypeIds.map((plateTypeId) => [plateTypeId, `stock-${plateTypeId}`]),
      ),
    };

    expect(paramFieldHasValue(draft.params.expression_temperature)).toBe(false);
    expect(getTaskConfigStatus(draft, template)).toBe("incomplete");
  });

  it("marks a draft complete when required params and plates are filled", () => {
    if (steps.length === 0) return;

    const step = steps[0]!;
    const templatePlateTypeIds = Object.keys(buildInitialDrafts([step])[step.key]!.plateAssignments);

    let drafts = buildInitialDrafts([step]);
    drafts = updateTaskDraft(drafts, step.key, {
      plateAssignments: Object.fromEntries(
        templatePlateTypeIds.map((plateTypeId) => [plateTypeId, `stock-${plateTypeId}`]),
      ),
    });

    expect(getTaskConfigStatusForStep(drafts[step.key], step.taskTemplateId)).toBe("complete");
    expect(isRunCreationDraftComplete([step], drafts)).toBe(true);
  });

  it("requires at least one selected step and a non-empty run name", () => {
    expect(canProceedFromRunStepSelection(0, "Run A")).toBe(false);
    expect(canProceedFromRunStepSelection(1, "   ")).toBe(false);
    expect(canProceedFromRunStepSelection(2, "Run A")).toBe(true);
  });
});
