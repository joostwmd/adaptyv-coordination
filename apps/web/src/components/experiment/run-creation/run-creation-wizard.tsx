import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@adaptyv-coordination/ui/components/button";
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

import {
  buildInitialDrafts,
  type RunCreationDraft,
} from "@/domain/run-creation/draft";
import {
  buildSelectableRunSteps,
  defaultSelectedStepKeys,
  resolveWorkflowForExperiment,
} from "@/domain/run-creation/workflow-steps";
import {
  RUN_CREATION_WIZARD_STEPS,
  type RunCreationWizardStep,
} from "@/domain/run-creation/types";
import { usePlanningStore } from "@/stores/usePlanningStore";
import type { ExperimentDetail } from "@/types";

import { RunCreationConfigurePanel } from "./run-creation-configure-panel";
import { RunCreationStepSelect } from "./run-creation-step-select";

type RunCreationWizardProps = {
  experiment: ExperimentDetail;
  onClose?: () => void;
};

export function RunCreationWizard({ experiment, onClose }: RunCreationWizardProps) {
  const createExperimentRunFromWizard = usePlanningStore(
    (s) => s.createExperimentRunFromWizard,
  );
  const workflow = useMemo(
    () => resolveWorkflowForExperiment(experiment),
    [experiment],
  );

  const selectableSteps = useMemo(
    () => (workflow ? buildSelectableRunSteps(workflow) : []),
    [workflow],
  );

  const [wizardStep, setWizardStep] = useState<RunCreationWizardStep>(
    RUN_CREATION_WIZARD_STEPS.selectTasks,
  );

  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(() =>
    defaultSelectedStepKeys(selectableSteps),
  );

  const [drafts, setDrafts] = useState<RunCreationDraft>({});
  const [activeConfigStepKey, setActiveConfigStepKey] = useState<string>("");

  useEffect(() => {
    if (!workflow) {
      setSelectedKeys(new Set());
      setWizardStep(RUN_CREATION_WIZARD_STEPS.selectTasks);
      return;
    }
    const steps = buildSelectableRunSteps(workflow);
    setSelectedKeys(defaultSelectedStepKeys(steps));
    setWizardStep(RUN_CREATION_WIZARD_STEPS.selectTasks);
    setDrafts({});
    setActiveConfigStepKey("");
  }, [experiment.id, workflow]);

  const selectedSteps = useMemo(
    () => selectableSteps.filter((s) => selectedKeys.has(s.key)),
    [selectableSteps, selectedKeys],
  );

  const enterConfigureStep = useCallback(() => {
    const steps = selectableSteps.filter((s) => selectedKeys.has(s.key));
    const initialDrafts = buildInitialDrafts(steps);
    setDrafts(initialDrafts);
    setActiveConfigStepKey(steps[0]?.key ?? "");
    setWizardStep(RUN_CREATION_WIZARD_STEPS.configure);
  }, [selectableSteps, selectedKeys]);

  const handleCreateRun = useCallback(() => {
    const result = createExperimentRunFromWizard({
      experimentId: experiment.id,
      selectedSteps,
      drafts,
    });

    if (!result) {
      toast.error("Could not create run", {
        description: "Check step selection and configuration, then try again.",
      });
      return;
    }

    const readyCount = result.tasks.filter((t) => t.readiness === "ready").length;
    toast.success("Run created", {
      description: `${result.tasks.length} tasks added to the planning queue (${readyCount} ready).`,
    });
    onClose?.();
  }, [
    createExperimentRunFromWizard,
    experiment.id,
    selectedSteps,
    drafts,
    onClose,
  ]);

  return (
    <Stepper
      value={wizardStep}
      onValueChange={(value) => {
        const next = value as RunCreationWizardStep;
        if (
          next === RUN_CREATION_WIZARD_STEPS.configure &&
          wizardStep === RUN_CREATION_WIZARD_STEPS.selectTasks
        ) {
          enterConfigureStep();
          return;
        }
        setWizardStep(next);
      }}
      nonInteractive
      className="flex h-full min-h-0 flex-col"
      onValidate={async (step) => {
        if (step === RUN_CREATION_WIZARD_STEPS.selectTasks) {
          return selectedKeys.size > 0;
        }
        return true;
      }}
    >
      <StepperList className="mb-2 shrink-0">
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
        className="flex min-h-0 flex-1 flex-col overflow-hidden"
      >
        <RunCreationConfigurePanel
          selectedSteps={selectedSteps}
          drafts={drafts}
          onDraftsChange={setDrafts}
          activeStepKey={activeConfigStepKey}
          onActiveStepKeyChange={setActiveConfigStepKey}
          onBack={() => setWizardStep(RUN_CREATION_WIZARD_STEPS.selectTasks)}
          onCreateRun={handleCreateRun}
        />
      </StepperContent>

      {wizardStep === RUN_CREATION_WIZARD_STEPS.selectTasks ? (
        <div className="mt-auto flex shrink-0 justify-end gap-2 border-t border-border/60 pt-3">
          <StepperNext asChild>
            <Button type="button" size="sm" disabled={selectedKeys.size === 0}>
              Continue
            </Button>
          </StepperNext>
        </div>
      ) : null}
    </Stepper>
  );
}
