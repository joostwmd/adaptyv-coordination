import { describe, expect, it } from "vitest";

import {
  classifyReadyTasks,
  getTicketsByPersonForDay,
  getUnscheduledWorkUnits,
} from "@/domain/planning/board-selectors";
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
});
