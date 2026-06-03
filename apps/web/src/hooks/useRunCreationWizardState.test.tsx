// @vitest-environment happy-dom

import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { RUN_CREATION_WIZARD_STEPS } from "@/features/experiments/detail/run-creation/constants";
import { buildInitialDrafts } from "@/domain/run-creation/draft";
import {
  buildSelectableRunSteps,
  resolveWorkflowForExperiment,
} from "@/domain/run-creation/workflow-steps";
import { useRunCreationWizardState } from "@/hooks/useRunCreationWizardState";
import { usePlanningBoardStore } from "@/stores/planning/usePlanningBoardStore";
import { seedExperiments } from "@/test/fixtures";

const mockCreateExperimentRunFromWizard = vi.fn();

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock("@/stores/planning/usePlanningBoardStore", () => ({
  usePlanningBoardStore: vi.fn(),
}));

import { toast } from "sonner";

describe("useRunCreationWizardState", () => {
  const experiment = seedExperiments[0]!;
  const workflow = resolveWorkflowForExperiment(experiment);
  const steps = workflow ? buildSelectableRunSteps(workflow).slice(0, 1) : [];

  beforeEach(() => {
    mockCreateExperimentRunFromWizard.mockReset();
    vi.mocked(toast.error).mockReset();
    vi.mocked(toast.success).mockReset();
    vi.mocked(usePlanningBoardStore).mockImplementation((selector) =>
      selector({
        createExperimentRunFromWizard: mockCreateExperimentRunFromWizard,
      } as ReturnType<typeof usePlanningBoardStore.getState>),
    );
  });

  it("blocks step one when no steps are selected or run name is blank", async () => {
    const { result } = renderHook(() =>
      useRunCreationWizardState({ experiment }),
    );

    await waitFor(() => {
      expect(result.current.selectableSteps.length).toBeGreaterThan(0);
    });

    act(() => {
      result.current.setSelectedKeys(new Set());
      result.current.setRunName("   ");
    });

    expect(result.current.canContinueFromStepOne).toBe(false);
  });

  it("focuses the first incomplete step when createRun validation fails", async () => {
    if (steps.length === 0) return;

    const step = steps[0]!;
    const { result } = renderHook(() =>
      useRunCreationWizardState({ experiment }),
    );

    await waitFor(() => {
      expect(result.current.selectableSteps.length).toBeGreaterThan(0);
    });

    act(() => {
      result.current.enterConfigureStep();
    });

    expect(result.current.wizardStep).toBe(RUN_CREATION_WIZARD_STEPS.configure);
    expect(result.current.drafts[step.key]).toBeDefined();

    act(() => {
      result.current.createRun();
    });

    expect(result.current.activeConfigStepKey).toBe(step.key);
    expect(toast.error).toHaveBeenCalledWith(
      "Could not create run",
      expect.objectContaining({
        description: expect.stringContaining(step.templateName),
      }),
    );
    expect(mockCreateExperimentRunFromWizard).not.toHaveBeenCalled();
  });

  it("calls onClose after a successful createRun", async () => {
    if (steps.length === 0) return;

    const onClose = vi.fn();
    mockCreateExperimentRunFromWizard.mockReturnValue({
      ok: true,
      run: { id: "run-1", name: "Run" },
      tasks: [{ id: "task-1", readiness: "ready" }],
    });

    const { result } = renderHook(() =>
      useRunCreationWizardState({ experiment, onClose }),
    );

    await waitFor(() => {
      expect(result.current.selectableSteps.length).toBeGreaterThan(0);
    });

    act(() => {
      result.current.setSelectedKeys(new Set([steps[0]!.key]));
      result.current.enterConfigureStep();
    });

    const plateTypeIds = Object.keys(
      buildInitialDrafts(steps)[steps[0]!.key]!.plateAssignments,
    );
    act(() => {
      result.current.setDrafts({
        ...result.current.drafts,
        [steps[0]!.key]: {
          ...result.current.drafts[steps[0]!.key]!,
          plateAssignments: Object.fromEntries(
            plateTypeIds.map((plateTypeId) => [plateTypeId, `stock-${plateTypeId}`]),
          ),
        },
      });
    });

    act(() => {
      result.current.createRun();
    });

    expect(mockCreateExperimentRunFromWizard).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });
});
