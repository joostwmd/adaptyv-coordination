import { describe, expect, it } from "vitest";

import {
  buildInitialDrafts,
  updateTaskDraft,
} from "@/domain/run-creation/draft";
import {
  buildSelectableRunSteps,
  resolveWorkflowForExperiment,
} from "@/domain/run-creation/workflow-steps";
import { seedExperiments } from "@/test/fixtures";

describe("run-creation draft", () => {
  const experiment = seedExperiments[0]!;
  const workflow = resolveWorkflowForExperiment(experiment);
  const steps = workflow ? buildSelectableRunSteps(workflow).slice(0, 1) : [];

  it("builds initial drafts with default params and plate slots", () => {
    if (steps.length === 0) return;

    const step = steps[0]!;
    const drafts = buildInitialDrafts(steps);
    const draft = drafts[step.key];

    expect(draft).toBeDefined();
    expect(draft!.stepKey).toBe(step.key);
    expect(Object.keys(draft!.plateAssignments).length).toBeGreaterThan(0);
    expect(Object.values(draft!.plateAssignments).every((value) => value === undefined)).toBe(
      true,
    );
  });

  it("returns the same drafts when updating a missing step key", () => {
    const drafts = buildInitialDrafts(steps);
    expect(updateTaskDraft(drafts, "missing-key", { params: { foo: "bar" } })).toBe(drafts);
  });

  it("merges param and plate patches immutably", () => {
    if (steps.length === 0) return;

    const step = steps[0]!;
    const initial = buildInitialDrafts(steps);
    const plateTypeId = Object.keys(initial[step.key]!.plateAssignments)[0]!;

    const next = updateTaskDraft(initial, step.key, {
      params: { custom: 42 },
      plateAssignments: { [plateTypeId]: "stock-123" },
    });

    expect(next).not.toBe(initial);
    expect(next[step.key]!.params.custom).toBe(42);
    expect(next[step.key]!.plateAssignments[plateTypeId]).toBe("stock-123");
    expect(initial[step.key]!.params.custom).toBeUndefined();
  });
});
