import { Button } from "@adaptyv-coordination/ui/components/button";
import { Input } from "@adaptyv-coordination/ui/components/input";
import { Label } from "@adaptyv-coordination/ui/components/label";
import {
  Stepper,
  StepperContent,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperList,
  StepperNext,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@adaptyv-coordination/ui/components/stepper";

import { useRunCreationWizardState } from "@/hooks/useRunCreationWizardState";
import type { ExperimentDetail } from "@/types";

import { RUN_CREATION_WIZARD_STEPS } from "./constants";
import { RunCreationConfigurePanel } from "./run-creation-configure-panel";
import { RunCreationStepSelect } from "./run-creation-step-select";

type RunCreationWizardProps = {
  experiment: ExperimentDetail;
  onClose?: () => void;
};

export function RunCreationWizard({ experiment, onClose }: RunCreationWizardProps) {
  const wizard = useRunCreationWizardState({ experiment, onClose });

  return (
    <Stepper
      value={wizard.wizardStep}
      onValueChange={(value) => wizard.handleStepChange(value as typeof wizard.wizardStep)}
      nonInteractive
      className="flex h-full min-h-0 flex-col"
      onValidate={async (step) => {
        if (step === RUN_CREATION_WIZARD_STEPS.selectTasks) {
          return wizard.canContinueFromStepOne;
        }
        return true;
      }}
    >
      <StepperList className="mb-2 shrink-0">
        <StepperItem value={RUN_CREATION_WIZARD_STEPS.selectTasks}>
          <StepperTrigger>
            <StepperIndicator />
            <div className="flex flex-col items-start text-left">
              <StepperTitle>Name & select</StepperTitle>
              <StepperDescription>Run name and workflow tasks</StepperDescription>
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
        <div className="flex flex-col gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="run-creation-name" className="text-xs text-muted-foreground">
              Run name
            </Label>
            <Input
              id="run-creation-name"
              value={wizard.runName}
              onChange={(event) => wizard.setRunName(event.target.value)}
              placeholder={wizard.defaultRunName}
              autoComplete="off"
            />
            <p className="text-xs text-muted-foreground">
              Shown on the experiment timeline and in planning.
            </p>
          </div>

          <RunCreationStepSelect
            workflowLabel={wizard.workflow?.label ?? "No workflow"}
            steps={wizard.selectableSteps}
            selectedKeys={wizard.selectedKeys}
            onSelectionChange={wizard.setSelectedKeys}
          />
        </div>
      </StepperContent>

      <StepperContent
        value={RUN_CREATION_WIZARD_STEPS.configure}
        className="flex min-h-0 flex-1 flex-col overflow-hidden"
      >
        <RunCreationConfigurePanel
          selectedSteps={wizard.selectedSteps}
          drafts={wizard.drafts}
          onDraftsChange={wizard.setDrafts}
          activeStepKey={wizard.activeConfigStepKey}
          onActiveStepKeyChange={wizard.setActiveConfigStepKey}
          onBack={() => wizard.setWizardStep(RUN_CREATION_WIZARD_STEPS.selectTasks)}
          onCreateRun={wizard.createRun}
        />
      </StepperContent>

      {wizard.wizardStep === RUN_CREATION_WIZARD_STEPS.selectTasks ? (
        <div className="mt-auto flex shrink-0 justify-end gap-2 border-t border-border/60 pt-3">
          <StepperNext asChild>
            <Button type="button" size="sm" disabled={!wizard.canContinueFromStepOne}>
              Continue
            </Button>
          </StepperNext>
        </div>
      ) : null}
    </Stepper>
  );
}
