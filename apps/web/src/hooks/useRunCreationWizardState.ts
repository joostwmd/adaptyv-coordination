import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { suggestDefaultRunName } from "@/domain/run-creation/create-run";
import {
  buildInitialDrafts,
  type RunCreationDraft,
} from "@/domain/run-creation/draft";
import type { SelectableRunStep } from "@/domain/run-creation/types";
import {
  canProceedFromRunStepSelection,
  validateRunCreationPayload,
} from "@/domain/run-creation/validation";
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
} from "@/features/experiments/detail/run-creation/constants";

type UseRunCreationWizardStateOptions = {
  experiment: ExperimentDetail;
  onClose?: () => void;
};

function getStepLabel(steps: SelectableRunStep[], stepKey: string): string {
  return steps.find((step) => step.key === stepKey)?.templateName ?? stepKey;
}

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

    setSelectedKeys(defaultSelectedStepKeys(selectableSteps));
    setWizardStep(RUN_CREATION_WIZARD_STEPS.selectTasks);
    setDrafts({});
    setActiveConfigStepKey("");
    setRunName(suggestDefaultRunName(experiment));
  }, [experiment, workflow, selectableSteps]);

  const selectedSteps = useMemo(
    () => selectableSteps.filter((step) => selectedKeys.has(step.key)),
    [selectableSteps, selectedKeys],
  );

  const canContinueFromStepOne = canProceedFromRunStepSelection(
    selectedKeys.size,
    runName,
  );

  const showIncompleteDraftsError = useCallback(
    (incompleteStepKeys: string[]) => {
      const firstKey = incompleteStepKeys[0];
      if (firstKey) {
        setActiveConfigStepKey(firstKey);
      }

      const label = firstKey ? getStepLabel(selectedSteps, firstKey) : "a step";
      const remaining = incompleteStepKeys.length - 1;

      toast.error("Could not create run", {
        description:
          remaining > 0
            ? `Complete configuration for ${label} and ${remaining} other step(s).`
            : `Complete configuration for ${label} before creating the run.`,
      });
    },
    [selectedSteps],
  );

  const enterConfigureStep = useCallback(() => {
    const steps = selectableSteps.filter((step) => selectedKeys.has(step.key));
    setDrafts(buildInitialDrafts(steps));
    setActiveConfigStepKey(steps[0]?.key ?? "");
    setWizardStep(RUN_CREATION_WIZARD_STEPS.configure);
  }, [selectableSteps, selectedKeys]);

  const createRun = useCallback(() => {
    const validation = validateRunCreationPayload(selectedSteps, drafts);
    if (!validation.ok) {
      showIncompleteDraftsError(validation.incompleteStepKeys);
      return;
    }

    const result = createExperimentRunFromWizard({
      experimentId: experiment.id,
      runName: runName.trim(),
      selectedSteps,
      drafts,
    });

    if (!result.ok) {
      if (result.reason === "incomplete_drafts") {
        showIncompleteDraftsError(result.incompleteStepKeys);
        return;
      }

      if (result.reason === "experiment_not_found") {
        toast.error("Could not create run", {
          description: "Experiment not found.",
        });
        return;
      }

      toast.error("Could not create run", {
        description: "Select at least one workflow step.",
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
    showIncompleteDraftsError,
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
