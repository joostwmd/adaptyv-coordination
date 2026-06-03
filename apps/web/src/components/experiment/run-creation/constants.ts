export const RUN_CREATION_WIZARD_STEPS = {
  selectTasks: "select-tasks",
  configure: "configure",
} as const;

export type RunCreationWizardStep =
  (typeof RUN_CREATION_WIZARD_STEPS)[keyof typeof RUN_CREATION_WIZARD_STEPS];
