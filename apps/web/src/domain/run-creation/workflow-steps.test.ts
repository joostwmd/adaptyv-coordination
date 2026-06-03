import { describe, expect, it } from "vitest";

import { getWorkflowTemplate } from "@/domain/workflow";
import {
  buildSelectableRunSteps,
  defaultSelectedStepKeys,
  resolveWorkflowForExperiment,
} from "@/domain/run-creation/workflow-steps";
import { seedExperiments } from "@/test/fixtures";

describe("workflow-steps", () => {
  const experiment = seedExperiments[0]!;

  it("resolves workflow by method name with type fallback", () => {
    const resolved = resolveWorkflowForExperiment(experiment);
    const byMethod = getWorkflowTemplate(experiment.type, experiment.methodName);
    const byType = getWorkflowTemplate(experiment.type);

    expect(resolved).toEqual(byMethod ?? byType);
    expect(resolved).toBeDefined();
  });

  it("builds selectable steps with stable keys and display metadata", () => {
    const workflow = resolveWorkflowForExperiment(experiment);
    if (!workflow) return;

    const steps = buildSelectableRunSteps(workflow);

    expect(steps.length).toBe(workflow.steps.length);
    expect(steps[0]?.key).toBe("step-0");
    expect(steps[0]?.templateName.length).toBeGreaterThan(0);
    expect(typeof steps[0]?.optional).toBe("boolean");
  });

  it("selects required steps by default and skips optional ones", () => {
    const workflow = resolveWorkflowForExperiment(experiment);
    if (!workflow) return;

    const steps = buildSelectableRunSteps(workflow);
    const selected = defaultSelectedStepKeys(steps);

    for (const step of steps) {
      if (step.optional) {
        expect(selected.has(step.key)).toBe(false);
      } else {
        expect(selected.has(step.key)).toBe(true);
      }
    }
  });
});
