import type { WorkflowStep } from "@/domain/workflow/types";

export type SelectableRunStep = {
  /** Stable key for selection state (`step-0`, `step-1`, …). */
  key: string;
  index: number;
  step: WorkflowStep;
  taskTemplateId: string;
  templateName: string;
  durationMinutes: number;
  optional: boolean;
};

export const RUN_CREATION_WIZARD_STEPS = {
  selectTasks: "select-tasks",
  configure: "configure",
} as const;

export type RunCreationWizardStep =
  (typeof RUN_CREATION_WIZARD_STEPS)[keyof typeof RUN_CREATION_WIZARD_STEPS];
