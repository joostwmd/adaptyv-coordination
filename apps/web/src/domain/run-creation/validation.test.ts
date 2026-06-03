import { describe, expect, it } from "vitest";

import { buildInitialDrafts, updateTaskDraft } from "@/domain/run-creation/draft";
import {
  getTaskConfigStatusForStep,
  isRunCreationDraftComplete,
} from "@/domain/run-creation/validation";
import { buildSelectableRunSteps, resolveWorkflowForExperiment } from "@/domain/run-creation/workflow-steps";
import { seedExperiments } from "@/test/fixtures";

describe("run-creation validation", () => {
  const experiment = seedExperiments[0]!;
  const workflow = resolveWorkflowForExperiment(experiment);
  const steps = workflow ? buildSelectableRunSteps(workflow).slice(0, 2) : [];

  it("marks incomplete drafts when required plates are unassigned", () => {
    if (steps.length === 0) return;

    const drafts = buildInitialDrafts(steps);
    const step = steps[0]!;

    expect(getTaskConfigStatusForStep(drafts[step.key], step.taskTemplateId)).toBe(
      "incomplete",
    );
    expect(isRunCreationDraftComplete(steps, drafts)).toBe(false);
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
});
