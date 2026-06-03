import { describe, expect, it } from "vitest";

import { buildExperimentsById } from "@/domain/experiment";
import { DEFAULT_PRIORITY_WEIGHTS } from "@/domain/priority";
import { previewPoolGroup, previewSoloUnit } from "@/domain/planning/queue-actions";
import { isUnitOverflowing } from "@/domain/planning/overflow";
import type { Task } from "@/domain/task/types";
import { planningSeed, seedExperiments } from "@/test/fixtures";

describe("queue-actions", () => {
  const experimentsById = buildExperimentsById(seedExperiments);
  const currentDay = planningSeed.tickets[0]?.scheduledDay ?? "2026-06-03";

  it("previews a solo unit from one task", () => {
    const task = planningSeed.tasks.find(
      (entry) => entry.readiness === "ready" && !entry.workUnitId,
    ) as Task;

    const preview = previewSoloUnit(task);

    expect(preview.taskIds).toEqual([task.id]);
    expect(preview.taskTemplateId).toBe(task.taskTemplateId);
  });

  it("previews split output when pool tasks exceed capacity", () => {
    const overflowingUnit = planningSeed.workUnits.find((workUnit) =>
      isUnitOverflowing(workUnit, planningSeed.tasks),
    );
    expect(overflowingUnit).toBeDefined();

    const poolTasks = planningSeed.tasks.filter((task) =>
      overflowingUnit!.taskIds.includes(task.id),
    );
    expect(poolTasks.length).toBeGreaterThan(1);

    const preview = previewPoolGroup(poolTasks, {
      experimentsById,
      weights: DEFAULT_PRIORITY_WEIGHTS,
      currentDay,
    });

    expect(preview.suggestedUnit.taskIds.length).toBe(poolTasks.length);
    expect(preview.showSplitPreview).toBe(true);
    expect(preview.splitPrimaryUnit).toBeDefined();
    expect(preview.splitSecondaryUnit).toBeDefined();
  });

  it("does not show split preview for a small pool group", () => {
    const templateTask = planningSeed.tasks.find(
      (task) => task.readiness === "ready" && !task.workUnitId,
    ) as Task;
    const pair = [
      { ...templateTask, id: "small-pool-a" },
      { ...templateTask, id: "small-pool-b" },
    ];

    const preview = previewPoolGroup(pair, {
      experimentsById,
      weights: DEFAULT_PRIORITY_WEIGHTS,
      currentDay,
    });

    expect(preview.showSplitPreview).toBe(false);
    expect(preview.splitPrimaryUnit).toBeUndefined();
    expect(preview.splitSecondaryUnit).toBeUndefined();
  });
});
