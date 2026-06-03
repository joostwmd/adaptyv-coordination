import { describe, expect, it } from "vitest";

import { buildInitialDrafts } from "@/domain/run-creation/draft";
import { buildRunCreationResult } from "@/domain/run-creation/create-run";
import {
  buildSelectableRunSteps,
  resolveWorkflowForExperiment,
} from "@/domain/run-creation/workflow-steps";
import { seedExperiments } from "@/test/fixtures";

describe("buildRunCreationResult", () => {
  const experiment = seedExperiments[0]!;
  const workflow = resolveWorkflowForExperiment(experiment);
  const steps = workflow ? buildSelectableRunSteps(workflow).slice(0, 1) : [];

  it("returns incomplete_drafts when required configuration is missing", () => {
    if (steps.length === 0) return;

    const drafts = buildInitialDrafts(steps);
    const result = buildRunCreationResult(experiment, steps, drafts);

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe("incomplete_drafts");
    expect(result.incompleteStepKeys.length).toBeGreaterThan(0);
  });

  it("returns no_tasks when no steps are selected", () => {
    const result = buildRunCreationResult(experiment, [], {});

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe("no_tasks");
  });

  it("returns ok with run and tasks when drafts are complete", () => {
    if (steps.length === 0) return;

    const step = steps[0]!;
    const plateTypeIds = Object.keys(buildInitialDrafts([step])[step.key]!.plateAssignments);
    let drafts = buildInitialDrafts(steps);
    drafts = {
      ...drafts,
      [step.key]: {
        ...drafts[step.key]!,
        plateAssignments: Object.fromEntries(
          plateTypeIds.map((plateTypeId) => [plateTypeId, `stock-${plateTypeId}`]),
        ),
      },
    };

    const result = buildRunCreationResult(experiment, steps, drafts, "Test run");

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.run.name).toBe("Test run");
    expect(result.tasks.length).toBe(steps.length);
  });
});
