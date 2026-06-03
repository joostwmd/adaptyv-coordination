import { describe, expect, it } from "vitest";

import { buildExperimentsById } from "@/domain/experiment";
import { DEFAULT_PRIORITY_WEIGHTS } from "@/domain/priority";
import {
  computeTaskPriorityScore,
  sortClassifiedQueue,
  sortSiblingUnitGroups,
} from "@/domain/planning/board-sort";
import {
  classifyReadyTasks,
  getUnscheduledWorkUnits,
} from "@/domain/planning/board-selectors";
import type { Task } from "@/domain/task/types";
import { computeWorkUnitKey } from "@/domain/work-unit/grouping";
import { planningSeed, seedExperiments } from "@/test/fixtures";

describe("board-sort", () => {
  const experimentsById = buildExperimentsById(seedExperiments);
  const referenceDay = planningSeed.tickets[0]?.scheduledDay ?? "2026-06-03";

  it("sorts queue sections by descending priority score", () => {
    const unscheduled = getUnscheduledWorkUnits(
      planningSeed.workUnits,
      planningSeed.tickets,
    );
    const queue = classifyReadyTasks(planningSeed.tasks, unscheduled);
    const sorted = sortClassifiedQueue(
      queue,
      experimentsById,
      DEFAULT_PRIORITY_WEIGHTS,
      referenceDay,
    );

    const poolScores = sorted.pool.map((group) =>
      group.tasks.reduce(
        (max, task) =>
          Math.max(
            max,
            sorted.attach.find((item) => item.task.id === task.id) ? 0 : 0,
          ),
        0,
      ),
    );

    expect(sorted.pool.length).toBe(queue.pool.length);
    expect(sorted.attach.length).toBe(queue.attach.length);
    expect(sorted.alone.length).toBe(queue.alone.length);

    for (let index = 1; index < sorted.alone.length; index += 1) {
      const previous = sorted.alone[index - 1]!;
      const current = sorted.alone[index]!;
      const previousScore = computeTaskPriorityScore(
        previous,
        experimentsById,
        DEFAULT_PRIORITY_WEIGHTS,
        referenceDay,
      );
      const currentScore = computeTaskPriorityScore(
        current,
        experimentsById,
        DEFAULT_PRIORITY_WEIGHTS,
        referenceDay,
      );
      expect(previousScore).toBeGreaterThanOrEqual(currentScore);
    }

    expect(poolScores.length).toBe(sorted.pool.length);
  });

  it("sorts sibling groups by max unit score then workUnitKey", () => {
    const unscheduled = getUnscheduledWorkUnits(
      planningSeed.workUnits,
      planningSeed.tickets,
    );
    const groups = unscheduled.reduce<Map<string, typeof unscheduled>>((map, unit) => {
      const list = map.get(unit.workUnitKey) ?? [];
      list.push(unit);
      map.set(unit.workUnitKey, list);
      return map;
    }, new Map());

    const siblingGroups = [...groups.values()].filter((group) => group.length > 0);
    const sorted = sortSiblingUnitGroups(
      siblingGroups,
      planningSeed.tasks,
      experimentsById,
      DEFAULT_PRIORITY_WEIGHTS,
      referenceDay,
    );

    expect(sorted.length).toBe(siblingGroups.length);
    for (const group of sorted) {
      for (let index = 1; index < group.length; index += 1) {
        expect(group[index - 1]!.id.localeCompare(group[index]!.id)).toBeLessThanOrEqual(0);
      }
    }
  });

  it("orders attach candidates deterministically by task id tie-break", () => {
    const templateTask = planningSeed.tasks.find(
      (task) => task.readiness === "ready" && !task.workUnitId,
    ) as Task;
    const workUnitKey = computeWorkUnitKey(templateTask);
    const taskA: Task = { ...templateTask, id: "sort-task-a" };
    const taskB: Task = { ...templateTask, id: "sort-task-b" };
    const candidate = {
      id: "candidate-unit",
      taskTemplateId: templateTask.taskTemplateId,
      workUnitKey,
      taskIds: [],
      status: "ready" as const,
    };

    const queue = classifyReadyTasks([taskB, taskA], [candidate]);
    const sorted = sortClassifiedQueue(
      queue,
      experimentsById,
      DEFAULT_PRIORITY_WEIGHTS,
      referenceDay,
    );

    expect(sorted.attach.map((item) => item.task.id)).toEqual(["sort-task-a", "sort-task-b"]);
  });
});
