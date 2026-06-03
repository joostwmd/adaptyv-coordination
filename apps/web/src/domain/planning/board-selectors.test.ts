import { describe, expect, it } from "vitest";

import {
  classifyReadyTasks,
  getTicketsByPersonForDay,
  getUnscheduledWorkUnits,
} from "@/domain/planning/board-selectors";
import { computeWorkUnitKey } from "@/domain/work-unit/grouping";
import type { Task } from "@/domain/task/types";
import { planningSeed, seedStaff } from "@/test/fixtures";

describe("board-selectors", () => {
  it("classifies the prototype planning seed into pool, attach, and alone", () => {
    const unscheduled = getUnscheduledWorkUnits(
      planningSeed.workUnits,
      planningSeed.tickets,
    );
    const queue = classifyReadyTasks(planningSeed.tasks, unscheduled);

    expect(queue.pool.length).toBeGreaterThan(0);
    expect(queue.attach.length).toBeGreaterThan(0);
    expect(queue.alone.length).toBeGreaterThan(0);

    expect(queue.pool.some((group) => group.tasks.length === 2)).toBe(true);

    for (const group of queue.pool) {
      expect(group.tasks.length).toBeGreaterThanOrEqual(2);
      for (const task of group.tasks) {
        expect(task.readiness).toBe("ready");
        expect(task.workUnitId).toBeUndefined();
      }
      expect(
        unscheduled.some((unit) => unit.workUnitKey === group.workUnitKey),
      ).toBe(false);
    }

    for (const { task, candidateUnits } of queue.attach) {
      expect(task.readiness).toBe("ready");
      expect(task.workUnitId).toBeUndefined();
      const key = computeWorkUnitKey(task);
      expect(candidateUnits.length).toBeGreaterThan(0);
      expect(candidateUnits.every((unit) => unit.workUnitKey === key)).toBe(true);
    }

    for (const task of queue.alone) {
      expect(task.readiness).toBe("ready");
      expect(task.workUnitId).toBeUndefined();
      const key = computeWorkUnitKey(task);
      expect(unscheduled.some((unit) => unit.workUnitKey === key)).toBe(false);
    }
  });

  it("places a solo ready task without candidates in alone", () => {
    const templateTask = planningSeed.tasks.find(
      (task) => task.readiness === "ready" && !task.workUnitId,
    ) as Task;
    const soloTask: Task = { ...templateTask, id: "solo-ready-task" };

    const queue = classifyReadyTasks([soloTask], []);

    expect(queue.alone).toEqual([soloTask]);
    expect(queue.pool).toHaveLength(0);
    expect(queue.attach).toHaveLength(0);
  });

  it("places paired ready tasks without candidates in pool", () => {
    const templateTask = planningSeed.tasks.find(
      (task) => task.readiness === "ready" && !task.workUnitId,
    ) as Task;
    const pairA: Task = { ...templateTask, id: "pool-task-a" };
    const pairB: Task = { ...templateTask, id: "pool-task-b" };

    const queue = classifyReadyTasks([pairA, pairB], []);

    expect(queue.pool).toEqual([
      { workUnitKey: computeWorkUnitKey(templateTask), tasks: [pairA, pairB] },
    ]);
    expect(queue.attach).toHaveLength(0);
    expect(queue.alone).toHaveLength(0);
  });

  it("places ready tasks with matching unscheduled units in attach", () => {
    const templateTask = planningSeed.tasks.find(
      (task) => task.readiness === "ready" && !task.workUnitId,
    ) as Task;
    const attachTask: Task = { ...templateTask, id: "attach-ready-task" };
    const workUnitKey = computeWorkUnitKey(templateTask);
    const candidate = {
      id: "candidate-unit",
      taskTemplateId: templateTask.taskTemplateId,
      workUnitKey,
      taskIds: [],
      status: "ready" as const,
    };

    const queue = classifyReadyTasks([attachTask], [candidate]);

    expect(queue.attach).toEqual([{ task: attachTask, candidateUnits: [candidate] }]);
    expect(queue.pool).toHaveLength(0);
    expect(queue.alone).toHaveLength(0);
  });

  it("excludes tasks that are not ready or already batched", () => {
    const templateTask = planningSeed.tasks.find(
      (task) => task.readiness === "ready" && !task.workUnitId,
    ) as Task;
    const blockedTask: Task = { ...templateTask, id: "blocked-task", readiness: "blocked" };
    const waitingTask: Task = {
      ...templateTask,
      id: "waiting-task",
      readiness: "waiting_upstream",
    };
    const batchedTask: Task = {
      ...templateTask,
      id: "batched-task",
      workUnitId: planningSeed.workUnits[0]!.id,
    };

    const queue = classifyReadyTasks([blockedTask, waitingTask, batchedTask], []);

    expect(queue.pool).toHaveLength(0);
    expect(queue.attach).toHaveLength(0);
    expect(queue.alone).toHaveLength(0);
  });

  it("excludes scheduled work units from the unscheduled list", () => {
    const unscheduled = getUnscheduledWorkUnits(
      planningSeed.workUnits,
      planningSeed.tickets,
    );
    const scheduledIds = new Set(planningSeed.tickets.map((ticket) => ticket.workUnitId));

    for (const workUnit of unscheduled) {
      expect(scheduledIds.has(workUnit.id)).toBe(false);
    }
  });

  it("returns only work units without a matching ticket", () => {
    const workUnits = [
      {
        id: "wu-scheduled",
        taskTemplateId: "template-a",
        workUnitKey: "key-a",
        taskIds: [],
        status: "ready" as const,
      },
      {
        id: "wu-free",
        taskTemplateId: "template-b",
        workUnitKey: "key-b",
        taskIds: [],
        status: "ready" as const,
      },
    ];
    const tickets = [
      {
        id: "ticket-1",
        workUnitId: "wu-scheduled",
        assigneeId: seedStaff[0]!.id,
        scheduledDay: "2026-06-03",
        status: "scheduled" as const,
      },
    ];

    expect(getUnscheduledWorkUnits(workUnits, tickets)).toEqual([workUnits[1]]);
  });

  it("groups tickets by assignee for a scheduled day", () => {
    const day = planningSeed.tickets[0]?.scheduledDay;
    expect(day).toBeDefined();

    const staffIds = seedStaff.map((member) => member.id);
    const byPerson = getTicketsByPersonForDay(planningSeed.tickets, day!, staffIds);

    const totalAssigned = Object.values(byPerson).reduce(
      (count, tickets) => count + tickets.length,
      0,
    );

    expect(totalAssigned).toBeGreaterThan(0);
    expect(byPerson[planningSeed.tickets[0]!.assigneeId]?.length).toBeGreaterThan(0);
  });

  it("omits tickets scheduled on other days", () => {
    const targetDay = "2026-06-03";
    const otherDay = "2026-06-04";
    const assigneeId = seedStaff[0]!.id;
    const tickets = [
      {
        id: "ticket-target-day",
        workUnitId: "work-unit-a",
        assigneeId,
        scheduledDay: targetDay,
        status: "scheduled" as const,
      },
      {
        id: "ticket-other-day",
        workUnitId: "work-unit-b",
        assigneeId,
        scheduledDay: otherDay,
        status: "scheduled" as const,
      },
    ];

    const byPerson = getTicketsByPersonForDay(tickets, targetDay, [assigneeId]);

    expect(byPerson[assigneeId]).toEqual([tickets[0]]);
  });

  it("ignores tickets for assignees outside the staff roster", () => {
    const day = "2026-06-03";
    const rosteredId = seedStaff[0]!.id;
    const tickets = [
      {
        id: "ticket-rostered",
        workUnitId: "work-unit-a",
        assigneeId: rosteredId,
        scheduledDay: day,
        status: "scheduled" as const,
      },
      {
        id: "ticket-off-roster",
        workUnitId: "work-unit-b",
        assigneeId: "staff-not-on-board",
        scheduledDay: day,
        status: "scheduled" as const,
      },
    ];

    const byPerson = getTicketsByPersonForDay(tickets, day, [rosteredId]);

    expect(byPerson[rosteredId]).toEqual([tickets[0]]);
    expect(Object.values(byPerson).flat()).toHaveLength(1);
  });
});
