import { beforeEach, describe, expect, it } from "vitest";

import type { Task } from "@/domain/task/types";
import type { Ticket } from "@/domain/ticket/types";
import type { WorkUnit } from "@/domain/work-unit/types";
import { computeWorkUnitKey } from "@/domain/work-unit/grouping";
import { usePlanningBoardStore } from "@/stores/planning/usePlanningBoardStore";
import { seedStaff } from "@/test/fixtures";

describe("usePlanningBoardStore", () => {
  beforeEach(() => {
    usePlanningBoardStore.getState().resetToSeed();
  });

  it("creates a work unit from ready tasks and batches them", () => {
    const state = usePlanningBoardStore.getState();
    const readyTask = state.tasks.find(
      (task) => task.readiness === "ready" && !task.workUnitId,
    ) as Task;

    const workUnit = state.createWorkUnitFromReadyTasks([readyTask.id]);
    const next = usePlanningBoardStore.getState();

    expect(workUnit).not.toBeNull();
    expect(next.workUnits.some((unit) => unit.id === workUnit!.id)).toBe(true);
    expect(next.tasks.find((task) => task.id === readyTask.id)?.readiness).toBe("batched");
  });

  it("upserts tickets when scheduling the same work unit twice", () => {
    const state = usePlanningBoardStore.getState();
    const workUnit = state.workUnits[0]!;
    const assigneeA = seedStaff[0]!.id;
    const assigneeB = seedStaff[1]?.id ?? assigneeA;

    const first = state.createTicket(workUnit.id, assigneeA, "2026-06-03");
    const second = usePlanningBoardStore
      .getState()
      .createTicket(workUnit.id, assigneeB, "2026-06-04");

    const tickets = usePlanningBoardStore.getState().tickets;

    expect(first).not.toBeNull();
    expect(second?.id).toBe(first?.id);
    expect(tickets.filter((ticket) => ticket.workUnitId === workUnit.id)).toHaveLength(1);
    expect(second?.assigneeId).toBe(assigneeB);
    expect(second?.scheduledDay).toBe("2026-06-04");
  });

  it("reverts a ticket to the queue by removing the unit and unbatching tasks", () => {
    const state = usePlanningBoardStore.getState();
    const workUnit = state.workUnits[0]!;
    const ticket = state.tickets.find((entry) => entry.workUnitId === workUnit.id) as Ticket;

    usePlanningBoardStore.getState().revertTicketToQueue(ticket.id);
    const next = usePlanningBoardStore.getState();

    expect(next.tickets.some((entry) => entry.id === ticket.id)).toBe(false);
    expect(next.workUnits.some((unit) => unit.id === workUnit.id)).toBe(false);
    for (const taskId of workUnit.taskIds) {
      const task = next.tasks.find((entry) => entry.id === taskId);
      expect(task?.workUnitId).toBeUndefined();
      expect(task?.readiness).toBe("ready");
    }
  });

  it("does not dissolve scheduled work units", () => {
    const state = usePlanningBoardStore.getState();
    const scheduledUnit = state.workUnits.find((unit) =>
      state.tickets.some((ticket) => ticket.workUnitId === unit.id),
    ) as WorkUnit;

    usePlanningBoardStore.getState().dissolveWorkUnit(scheduledUnit.id);
    const next = usePlanningBoardStore.getState();

    expect(next.workUnits.some((unit) => unit.id === scheduledUnit.id)).toBe(true);
  });

  it("dissolves unscheduled work units back to ready tasks", () => {
    const state = usePlanningBoardStore.getState();
    const readyTask = state.tasks.find(
      (task) => task.readiness === "ready" && !task.workUnitId,
    ) as Task;
    const workUnit = state.createWorkUnitFromReadyTasks([readyTask.id])!;

    usePlanningBoardStore.getState().dissolveWorkUnit(workUnit.id);
    const next = usePlanningBoardStore.getState();

    expect(next.workUnits.some((unit) => unit.id === workUnit.id)).toBe(false);
    expect(next.tasks.find((task) => task.id === readyTask.id)?.readiness).toBe("ready");
  });

  it("adds a ready task to an existing unscheduled unit", () => {
    const state = usePlanningBoardStore.getState();
    const templateTask = state.tasks.find(
      (task) => task.readiness === "ready" && !task.workUnitId,
    ) as Task;
    const workUnitKey = computeWorkUnitKey(templateTask);
    const existingUnit: WorkUnit = {
      id: "manual-unit",
      taskTemplateId: templateTask.taskTemplateId,
      workUnitKey,
      taskIds: [],
      status: "ready",
    };

    usePlanningBoardStore.setState({
      workUnits: [...state.workUnits, existingUnit],
    });

    usePlanningBoardStore.getState().addTaskToWorkUnit(templateTask.id, existingUnit.id);
    const next = usePlanningBoardStore.getState();

    expect(next.workUnits.find((unit) => unit.id === existingUnit.id)?.taskIds).toContain(
      templateTask.id,
    );
    expect(next.tasks.find((task) => task.id === templateTask.id)?.readiness).toBe("batched");
  });
});
