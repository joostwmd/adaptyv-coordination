import { useEffect, useMemo, useState } from "react";

import { Button } from "@adaptyv-coordination/ui/components/button";
import {
  Stepper,
  StepperContent,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperList,
  StepperNext,
  StepperPrev,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@adaptyv-coordination/ui/components/stepper";

import {
  buildSelectableRunSteps,
  defaultSelectedStepKeys,
  resolveWorkflowForExperiment,
} from "@/domain/run-creation/workflow-steps";
import {
  RUN_CREATION_WIZARD_STEPS,
  type RunCreationWizardStep,
} from "@/domain/run-creation/types";
import type { ExperimentDetail } from "@/types";

import { RunCreationStepSelect } from "./run-creation-step-select";

type RunCreationWizardProps = {
  experiment: ExperimentDetail;
};

export function RunCreationWizard({ experiment }: RunCreationWizardProps) {
  const workflow = useMemo(
    () => resolveWorkflowForExperiment(experiment),
    [experiment],
  );

  const selectableSteps = useMemo(
    () => (workflow ? buildSelectableRunSteps(workflow) : []),
    [workflow],
  );

  const [activeStep, setActiveStep] = useState<RunCreationWizardStep>(
    RUN_CREATION_WIZARD_STEPS.selectTasks,
  );

  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(() =>
    defaultSelectedStepKeys(selectableSteps),
  );

  useEffect(() => {
    if (!workflow) {
      setSelectedKeys(new Set());
      setActiveStep(RUN_CREATION_WIZARD_STEPS.selectTasks);
      return;
    }
    const steps = buildSelectableRunSteps(workflow);
    setSelectedKeys(defaultSelectedStepKeys(steps));
    setActiveStep(RUN_CREATION_WIZARD_STEPS.selectTasks);
  }, [experiment.id, workflow]);

  const selectedSteps = useMemo(
    () => selectableSteps.filter((s) => selectedKeys.has(s.key)),
    [selectableSteps, selectedKeys],
  );

  return (
    <Stepper
      value={activeStep}
      onValueChange={(value) => setActiveStep(value as RunCreationWizardStep)}
      nonInteractive
      className="flex h-full min-h-0 flex-col"
      onValidate={async (step) => {
        if (step === RUN_CREATION_WIZARD_STEPS.selectTasks) {
          return selectedKeys.size > 0;
        }
        return true;
      }}
    >
      <StepperList className="mb-1">
        <StepperItem value={RUN_CREATION_WIZARD_STEPS.selectTasks}>
          <StepperTrigger>
            <StepperIndicator />
            <div className="flex flex-col items-start text-left">
              <StepperTitle>Select steps</StepperTitle>
              <StepperDescription>Choose workflow tasks</StepperDescription>
            </div>
          </StepperTrigger>
          <StepperSeparator />
        </StepperItem>
        <StepperItem value={RUN_CREATION_WIZARD_STEPS.configure}>
          <StepperTrigger>
            <StepperIndicator />
            <div className="flex flex-col items-start text-left">
              <StepperTitle>Configure</StepperTitle>
              <StepperDescription>Params and inputs</StepperDescription>
            </div>
          </StepperTrigger>
        </StepperItem>
      </StepperList>

      <StepperContent
        value={RUN_CREATION_WIZARD_STEPS.selectTasks}
        className="min-h-0 flex-1 overflow-y-auto pb-4"
      >
        <RunCreationStepSelect
          workflowLabel={workflow?.label ?? "No workflow"}
          steps={selectableSteps}
          selectedKeys={selectedKeys}
          onSelectionChange={setSelectedKeys}
        />
      </StepperContent>

      <StepperContent
        value={RUN_CREATION_WIZARD_STEPS.configure}
        className="min-h-0 flex-1 overflow-y-auto pb-4"
      >
        <div className="rounded-lg border border-dashed border-border/80 bg-muted/20 px-4 py-8 text-center">
          <p className="text-sm font-medium text-foreground">
            Configure parameters and inputs
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            {selectedSteps.length} step
            {selectedSteps.length === 1 ? "" : "s"} selected — form fields for each
            task will appear here next.
          </p>
        </div>
      </StepperContent>

      <div className="mt-auto flex shrink-0 items-center justify-between gap-3 border-t border-border/60 pt-4">
        {activeStep === RUN_CREATION_WIZARD_STEPS.selectTasks ? (
          <span />
        ) : (
          <StepperPrev asChild>
            <Button type="button" variant="outline" size="sm">
              Back
            </Button>
          </StepperPrev>
        )}

        {activeStep === RUN_CREATION_WIZARD_STEPS.selectTasks ? (
          <StepperNext asChild>
            <Button type="button" size="sm" disabled={selectedKeys.size === 0}>
              Continue
            </Button>
          </StepperNext>
        ) : (
          <Button type="button" size="sm" disabled title="Coming in the next step">
            Create run
          </Button>
        )}
      </div>
    </Stepper>
  );
}
