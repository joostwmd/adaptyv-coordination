import { useMemo } from "react";

import { Button } from "@adaptyv-coordination/ui/components/button";

import type { RunCreationDraft } from "@/domain/run-creation/draft";
import { updateTaskDraft, type RunTaskDraft } from "@/domain/run-creation/draft";
import {
  getTaskConfigStatusForStep,
  isRunCreationDraftComplete,
} from "@/domain/run-creation/validation";
import type { SelectableRunStep } from "@/domain/run-creation/types";

import { RunCreationConfigSidebar } from "./run-creation-config-sidebar";
import { RunCreationTaskConfigForm } from "./run-creation-task-config-form";

type RunCreationConfigurePanelProps = {
  selectedSteps: SelectableRunStep[];
  drafts: RunCreationDraft;
  onDraftsChange: (drafts: RunCreationDraft) => void;
  activeStepKey: string;
  onActiveStepKeyChange: (stepKey: string) => void;
  onBack: () => void;
  onCreateRun: () => void;
};

export function RunCreationConfigurePanel({
  selectedSteps,
  drafts,
  onDraftsChange,
  activeStepKey,
  onActiveStepKeyChange,
  onBack,
  onCreateRun,
}: RunCreationConfigurePanelProps) {
  const statuses = useMemo(() => {
    const map: Record<string, ReturnType<typeof getTaskConfigStatusForStep>> = {};
    for (const step of selectedSteps) {
      map[step.key] = getTaskConfigStatusForStep(
        drafts[step.key],
        step.taskTemplateId,
      );
    }
    return map;
  }, [selectedSteps, drafts]);

  const allComplete = isRunCreationDraftComplete(selectedSteps, drafts);
  const activeIndex = selectedSteps.findIndex((s) => s.key === activeStepKey);
  const activeStep = selectedSteps[activeIndex];
  const activeDraft = activeStep ? drafts[activeStep.key] : undefined;
  const isLastStep = activeIndex >= 0 && activeIndex === selectedSteps.length - 1;
  const activeStepComplete = statuses[activeStepKey] === "complete";

  const goToNextStep = () => {
    if (activeIndex < 0 || isLastStep) return;
    const next = selectedSteps[activeIndex + 1];
    if (next) onActiveStepKeyChange(next.key);
  };

  const handleDraftChange = (patch: Partial<Pick<RunTaskDraft, "params" | "plateAssignments">>) => {
    if (!activeStep) return;
    onDraftsChange(updateTaskDraft(drafts, activeStep.key, patch));
  };

  if (selectedSteps.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No steps selected.</p>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex min-h-0 flex-1 overflow-hidden rounded-lg border border-border/60">
        <RunCreationConfigSidebar
          steps={selectedSteps}
          activeStepKey={activeStepKey}
          statuses={statuses}
          onSelectStep={onActiveStepKeyChange}
        />

        <div className="min-h-0 min-w-0 flex-1 overflow-y-auto p-4">
          {activeStep && activeDraft ? (
            <RunCreationTaskConfigForm
              key={activeStep.key}
              step={activeStep}
              draft={activeDraft}
              onDraftChange={handleDraftChange}
            />
          ) : null}
        </div>
      </div>

      <div className="mt-3 flex shrink-0 items-center justify-between gap-3 border-t border-border/60 pt-3">
        <Button type="button" variant="outline" size="sm" onClick={onBack}>
          Back
        </Button>

        <div className="flex items-center gap-2">
          {!isLastStep ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!activeStepComplete}
              onClick={goToNextStep}
            >
              Next step
            </Button>
          ) : null}
          <Button
            type="button"
            size="sm"
            disabled={!allComplete}
            onClick={onCreateRun}
          >
            Create run
          </Button>
        </div>
      </div>
    </div>
  );
}
