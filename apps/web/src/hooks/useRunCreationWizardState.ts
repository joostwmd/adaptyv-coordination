import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { suggestDefaultRunName } from "@/domain/run-creation/create-run";
import {
  buildInitialDrafts,
  type RunCreationDraft,
} from "@/domain/run-creation/draft";
import {
  buildSelectableRunSteps,
  defaultSelectedStepKeys,
  resolveWorkflowForExperiment,
} from "@/domain/run-creation/workflow-steps";
import { usePlanningBoardStore } from "@/stores/planning/usePlanningBoardStore";
import type { ExperimentDetail } from "@/types";

import {
  RUN_CREATION_WIZARD_STEPS,
  type RunCreationWizardStep,
} from "@/components/experiment/run-creation/constants";

type UseRunCreationWizardStateOptions = {
  experiment: ExperimentDetail;
  onClose?: () => void;
};

export function useRunCreationWizardState({
  experiment,
  onClose,
}: UseRunCreationWizardStateOptions) {
  const createExperimentRunFromWizard = usePlanningBoardStore(
    (state) => state.createExperimentRunFromWizard,
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
  const [activeConfigStepKey, setActiveConfigStepKey] = useState("");
  const [runName, setRunName] = useState(() => suggestDefaultRunName(experiment));

  useEffect(() => {
    if (!workflow) {
      setSelectedKeys(new Set());
      setWizardStep(RUN_CREATION_WIZARD_STEPS.selectTasks);
      setRunName(suggestDefaultRunName(experiment));
      return;
    }

    const steps = buildSelectableRunSteps(workflow);
    setSelectedKeys(defaultSelectedStepKeys(steps));
    setWizardStep(RUN_CREATION_WIZARD_STEPS.selectTasks);
    setDrafts({});
    setActiveConfigStepKey("");
    setRunName(suggestDefaultRunName(experiment));
  }, [experiment, workflow]);

  const selectedSteps = useMemo(
    () => selectableSteps.filter((step) => selectedKeys.has(step.key)),
    [selectableSteps, selectedKeys],
  );

  const canContinueFromStepOne =
    selectedKeys.size > 0 && runName.trim().length > 0;

  const enterConfigureStep = useCallback(() => {
    const steps = selectableSteps.filter((step) => selectedKeys.has(step.key));
    setDrafts(buildInitialDrafts(steps));
    setActiveConfigStepKey(steps[0]?.key ?? "");
    setWizardStep(RUN_CREATION_WIZARD_STEPS.configure);
  }, [selectableSteps, selectedKeys]);

  const createRun = useCallback(() => {
    const result = createExperimentRunFromWizard({
      experimentId: experiment.id,
      runName: runName.trim(),
      selectedSteps,
      drafts,
    });

    if (!result) {
      toast.error("Could not create run", {
        description: "Complete all step configuration before creating the run.",
      });
      return;
    }

    const readyCount = result.tasks.filter((task) => task.readiness === "ready").length;
    toast.success("Run created", {
      description: `${result.tasks.length} tasks added to the planning queue (${readyCount} ready).`,
    });
    onClose?.();
  }, [
    createExperimentRunFromWizard,
    experiment.id,
    runName,
    selectedSteps,
    drafts,
    onClose,
  ]);

  const handleStepChange = useCallback(
    (value: RunCreationWizardStep) => {
      if (
        value === RUN_CREATION_WIZARD_STEPS.configure &&
        wizardStep === RUN_CREATION_WIZARD_STEPS.selectTasks
      ) {
        enterConfigureStep();
        return;
      }
      setWizardStep(value);
    },
    [enterConfigureStep, wizardStep],
  );

  return {
    workflow,
    selectableSteps,
    selectedSteps,
    wizardStep,
    selectedKeys,
    setSelectedKeys,
    drafts,
    setDrafts,
    activeConfigStepKey,
    setActiveConfigStepKey,
    runName,
    setRunName,
    canContinueFromStepOne,
    enterConfigureStep,
    createRun,
    handleStepChange,
    setWizardStep,
    defaultRunName: suggestDefaultRunName(experiment),
  };
}

export { RUN_CREATION_WIZARD_STEPS };
