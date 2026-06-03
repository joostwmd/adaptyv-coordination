// @vitest-environment happy-dom

import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { usePlanningDayBoard } from "@/hooks/usePlanningDayBoard";
import { usePlanningBoardStore } from "@/stores/planning/usePlanningBoardStore";
import { usePrototypeStore } from "@/stores/usePrototypeStore";
import { planningSeed, seedStaff } from "@/test/fixtures";

describe("usePlanningDayBoard", () => {
  beforeEach(() => {
    usePlanningBoardStore.getState().resetToSeed();
  });

  it("returns kanban roster entries and tickets grouped by assignee for the current day", () => {
    const ticket = planningSeed.tickets[0]!;
    usePlanningBoardStore.setState({
      tickets: [ticket],
      currentDay: ticket.scheduledDay,
    });
    usePrototypeStore.setState({ staff: seedStaff });

    const { result } = renderHook(() => usePlanningDayBoard());

    expect(result.current.currentDay).toBe(ticket.scheduledDay);
    expect(result.current.kanbanRoster.length).toBeGreaterThan(0);
    expect(result.current.ticketsByPerson[ticket.assigneeId]).toEqual([ticket]);
  });

  it("excludes tickets scheduled on other days", () => {
    const ticket = planningSeed.tickets[0]!;
    usePlanningBoardStore.setState({
      tickets: [ticket],
      currentDay: "2099-01-01",
    });
    usePrototypeStore.setState({ staff: seedStaff });

    const { result } = renderHook(() => usePlanningDayBoard());

    expect(result.current.ticketsByPerson[ticket.assigneeId]).toEqual([]);
  });
});
