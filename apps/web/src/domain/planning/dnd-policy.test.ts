import { describe, expect, it, vi } from "vitest";

import {
  applyPlanningDropAction,
  resolvePlanningDrop,
  type PlanningDragData,
  type PlanningDropData,
} from "@/domain/planning/dnd-policy";

function mockDropActions() {
  return {
    createTicket: vi.fn(),
    updateTicket: vi.fn(),
    unscheduleTicket: vi.fn(),
    revertTicketToQueue: vi.fn(),
    dissolveWorkUnit: vi.fn(),
    removeTaskFromWorkUnit: vi.fn(),
    addTaskToWorkUnit: vi.fn(),
  };
}

describe("resolvePlanningDrop", () => {
  it("returns noop when source data is missing", () => {
    expect(resolvePlanningDrop("id", undefined, undefined)).toEqual({ type: "noop" });
  });

  it("schedules a unit dropped on a kanban cell", () => {
    const source: PlanningDragData = { kind: "unit", workUnitId: "wu-1" };
    const target: PlanningDropData = {
      kind: "kanban-cell",
      staffId: "staff-1",
      day: "2026-06-03",
    };

    expect(resolvePlanningDrop("wu-1", source, target)).toEqual({
      type: "schedule",
      workUnitId: "wu-1",
      staffId: "staff-1",
      day: "2026-06-03",
    });
  });

  it("returns noop when a unit drop lacks workUnitId", () => {
    const source: PlanningDragData = { kind: "unit" };
    const target: PlanningDropData = {
      kind: "kanban-cell",
      staffId: "staff-1",
      day: "2026-06-03",
    };

    expect(resolvePlanningDrop("wu-1", source, target)).toEqual({ type: "noop" });
  });

  it("reschedules a ticket dropped on a kanban cell", () => {
    const source: PlanningDragData = { kind: "ticket" };
    const target: PlanningDropData = {
      kind: "kanban-cell",
      staffId: "staff-2",
      day: "2026-06-04",
    };

    expect(resolvePlanningDrop("ticket-1", source, target)).toEqual({
      type: "reschedule",
      ticketId: "ticket-1",
      staffId: "staff-2",
      day: "2026-06-04",
    });
  });

  it("unschedules a ticket dropped on the units zone", () => {
    expect(
      resolvePlanningDrop(
        "ticket-1",
        { kind: "ticket" },
        { kind: "units-zone" },
      ),
    ).toEqual({ type: "unschedule", ticketId: "ticket-1" });
  });

  it("reverts a ticket dropped on the queue zone", () => {
    expect(
      resolvePlanningDrop(
        "ticket-1",
        { kind: "ticket" },
        { kind: "queue-zone" },
      ),
    ).toEqual({ type: "revertToQueue", ticketId: "ticket-1" });
  });

  it("dissolves a unit dropped on the queue zone", () => {
    expect(
      resolvePlanningDrop(
        "wu-1",
        { kind: "unit", workUnitId: "wu-1" },
        { kind: "queue-zone" },
      ),
    ).toEqual({ type: "dissolve", workUnitId: "wu-1" });
  });

  it("moves a task to a sibling unit with matching workUnitKey", () => {
    expect(
      resolvePlanningDrop(
        "task-1",
        { kind: "task", workUnitKey: "key-a" },
        { kind: "sibling-unit", workUnitId: "wu-2", workUnitKey: "key-a" },
      ),
    ).toEqual({
      type: "moveTaskToSibling",
      taskId: "task-1",
      workUnitId: "wu-2",
      workUnitKey: "key-a",
    });
  });

  it("returns noop when sibling keys do not match", () => {
    expect(
      resolvePlanningDrop(
        "task-1",
        { kind: "task", workUnitKey: "key-a" },
        { kind: "sibling-unit", workUnitId: "wu-2", workUnitKey: "key-b" },
      ),
    ).toEqual({ type: "noop" });
  });
});

describe("applyPlanningDropAction", () => {
  it("delegates each action type to the matching store handler", () => {
    const store = mockDropActions();

    applyPlanningDropAction(
      { type: "schedule", workUnitId: "wu-1", staffId: "s-1", day: "2026-06-03" },
      store,
    );
    expect(store.createTicket).toHaveBeenCalledWith("wu-1", "s-1", "2026-06-03");

    applyPlanningDropAction(
      {
        type: "reschedule",
        ticketId: "t-1",
        staffId: "s-2",
        day: "2026-06-04",
      },
      store,
    );
    expect(store.updateTicket).toHaveBeenCalledWith("t-1", {
      assigneeId: "s-2",
      scheduledDay: "2026-06-04",
    });

    applyPlanningDropAction({ type: "unschedule", ticketId: "t-1" }, store);
    expect(store.unscheduleTicket).toHaveBeenCalledWith("t-1");

    applyPlanningDropAction({ type: "revertToQueue", ticketId: "t-1" }, store);
    expect(store.revertTicketToQueue).toHaveBeenCalledWith("t-1");

    applyPlanningDropAction({ type: "dissolve", workUnitId: "wu-1" }, store);
    expect(store.dissolveWorkUnit).toHaveBeenCalledWith("wu-1");

    applyPlanningDropAction(
      {
        type: "moveTaskToSibling",
        taskId: "task-1",
        workUnitId: "wu-2",
        workUnitKey: "key-a",
      },
      store,
    );
    expect(store.removeTaskFromWorkUnit).toHaveBeenCalledWith("task-1");
    expect(store.addTaskToWorkUnit).toHaveBeenCalledWith("task-1", "wu-2");

    applyPlanningDropAction({ type: "noop" }, store);
    expect(store.createTicket).toHaveBeenCalledTimes(1);
  });
});
