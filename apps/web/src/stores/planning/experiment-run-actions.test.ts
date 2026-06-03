import { describe, expect, it, vi } from "vitest";

import { buildInitialDrafts } from "@/domain/run-creation/draft";
import {
  buildTasksFromRunCreation,
  buildNewRunSummary,
} from "@/domain/run-creation/create-run";
import {
  buildSelectableRunSteps,
  resolveWorkflowForExperiment,
} from "@/domain/run-creation/workflow-steps";
import {
  createExperimentRunFromWizard,
  scaffoldFromExperiment,
  type ExperimentRunActionsDeps,
} from "@/stores/planning/experiment-run-actions";
import type { Task } from "@/types";
import { seedExperiments } from "@/test/fixtures";

function completeDraftsForSteps(
  steps: ReturnType<typeof buildSelectableRunSteps>,
) {
  let drafts = buildInitialDrafts(steps);
  for (const step of steps) {
    const plateTypeIds = Object.keys(drafts[step.key]!.plateAssignments);
    drafts = {
      ...drafts,
      [step.key]: {
        ...drafts[step.key]!,
        plateAssignments: Object.fromEntries(
          plateTypeIds.map((plateTypeId) => [plateTypeId, `stock-${plateTypeId}`]),
        ),
      },
    };
  }
  return drafts;
}

describe("experiment-run-actions", () => {
  const experiment = seedExperiments[0]!;

  function createDeps(overrides: Partial<ExperimentRunActionsDeps> = {}) {
    const appendTasks = vi.fn<(tasks: Task[]) => void>();
    const addExperimentRunWithTasks = vi.fn();
    const getPrototypeState = vi.fn(() => ({
      experiments: [experiment],
      addExperimentRunWithTasks,
    }));

    return {
      deps: {
        getPrototypeState,
        appendTasks,
        ...overrides,
      } as ExperimentRunActionsDeps,
      appendTasks,
      addExperimentRunWithTasks,
    };
  }

  it("returns experiment_not_found when the experiment is missing", () => {
    const { deps } = createDeps({
      getPrototypeState: vi.fn(() => ({ experiments: [], addExperimentRunWithTasks: vi.fn() })),
    });

    expect(
      createExperimentRunFromWizard(
        {
          experimentId: "missing",
          runName: "Run",
          selectedSteps: [],
          drafts: {},
        },
        deps,
      ),
    ).toEqual({ ok: false, reason: "experiment_not_found" });
  });

  it("creates a run and appends tasks when drafts are complete", () => {
    const workflow = resolveWorkflowForExperiment(experiment);
    if (!workflow) return;

    const steps = buildSelectableRunSteps(workflow).slice(0, 1);
    const drafts = completeDraftsForSteps(steps);
    const { deps, appendTasks, addExperimentRunWithTasks } = createDeps();

    const result = createExperimentRunFromWizard(
      {
        experimentId: experiment.id,
        runName: "Batch A",
        selectedSteps: steps,
        drafts,
      },
      deps,
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(addExperimentRunWithTasks).toHaveBeenCalledWith(
      experiment.id,
      result.run,
      result.tasks,
    );
    expect(appendTasks).toHaveBeenCalledWith(result.tasks);
  });

  it("propagates incomplete draft failures from buildRunCreationResult", () => {
    const workflow = resolveWorkflowForExperiment(experiment);
    if (!workflow) return;

    const steps = buildSelectableRunSteps(workflow).slice(0, 1);
    const { deps, appendTasks } = createDeps();

    const result = createExperimentRunFromWizard(
      {
        experimentId: experiment.id,
        runName: "Batch A",
        selectedSteps: steps,
        drafts: buildInitialDrafts(steps),
      },
      deps,
    );

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe("incomplete_drafts");
    expect(appendTasks).not.toHaveBeenCalled();
  });

  it("scaffolds tasks from the primary experiment run", () => {
    const { deps, appendTasks } = createDeps();
    const tasks = scaffoldFromExperiment(experiment.id, deps);

    expect(tasks.length).toBeGreaterThan(0);
    expect(appendTasks).toHaveBeenCalledWith(tasks);
  });

  it("returns an empty task list when scaffolding cannot resolve a run", () => {
    const appendTasks = vi.fn();
    const deps: ExperimentRunActionsDeps = {
      appendTasks,
      getPrototypeState: vi.fn(() => ({
        experiments: [{ ...experiment, runs: [] }],
      })),
    };

    expect(scaffoldFromExperiment(experiment.id, deps)).toEqual([]);
    expect(appendTasks).not.toHaveBeenCalled();
  });
});

describe("buildTasksFromRunCreation", () => {
  it("chains dependsOn across ordered workflow steps", () => {
    const experiment = seedExperiments[0]!;
    const workflow = resolveWorkflowForExperiment(experiment);
    if (!workflow) return;

    const steps = buildSelectableRunSteps(workflow).slice(0, 2);
    if (steps.length < 2) return;

    const drafts = completeDraftsForSteps(steps);
    const { runs: _runs, ...summary } = experiment;
    const run = buildNewRunSummary(experiment, "Linked run");
    const tasks = buildTasksFromRunCreation(summary, run, steps, drafts);

    expect(tasks).toHaveLength(2);
    expect(tasks[0]?.dependsOn).toEqual([]);
    expect(tasks[1]?.dependsOn).toEqual([tasks[0]!.id]);
  });
});
