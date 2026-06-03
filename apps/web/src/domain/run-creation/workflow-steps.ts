import { getTaskTemplate } from "@/domain/task-template/catalog";
import { getWorkflowTemplate } from "@/domain/workflow";
import type { WorkflowTemplate } from "@/domain/workflow/types";
import type { ExperimentDetail } from "@/types";

import type { SelectableRunStep } from "./types";

export function resolveWorkflowForExperiment(
  experiment: ExperimentDetail,
): WorkflowTemplate | undefined {
  return (
    getWorkflowTemplate(experiment.type, experiment.methodName) ??
    getWorkflowTemplate(experiment.type)
  );
}

export function buildSelectableRunSteps(
  workflow: WorkflowTemplate,
): SelectableRunStep[] {
  return workflow.steps.map((step, index) => {
    const template = getTaskTemplate(step.taskTemplateId);
    return {
      key: `step-${index}`,
      index,
      step,
      taskTemplateId: step.taskTemplateId,
      templateName: template?.name ?? "Unknown task",
      durationMinutes: template?.durationMinutes ?? 0,
      optional: step.optional ?? false,
    };
  });
}

export function defaultSelectedStepKeys(steps: SelectableRunStep[]): Set<string> {
  return new Set(
    steps.filter((s) => !s.optional).map((s) => s.key),
  );
}
