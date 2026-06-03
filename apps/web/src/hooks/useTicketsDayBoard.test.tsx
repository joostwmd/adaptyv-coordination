// @vitest-environment happy-dom

import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { useTicketsDayBoard } from "@/hooks/useTicketsDayBoard";
import { usePlanningBoardStore } from "@/stores/planning/usePlanningBoardStore";
import { usePrototypeStore } from "@/stores/usePrototypeStore";
import { planningSeed, seedStaff } from "@/test/fixtures";

describe("useTicketsDayBoard", () => {
  beforeEach(() => {
    usePlanningBoardStore.getState().resetToSeed();
  });

  it("returns rows only for staff with tickets on the current day", () => {
    const ticket = planningSeed.tickets[0]!;
    usePlanningBoardStore.setState({
      tickets: [ticket],
      currentDay: ticket.scheduledDay,
    });
    usePrototypeStore.setState({ staff: seedStaff });

    const { result } = renderHook(() => useTicketsDayBoard());

    expect(result.current.currentDay).toBe(ticket.scheduledDay);
    expect(result.current.rows).toHaveLength(1);
    expect(result.current.rows[0]?.tickets).toEqual([ticket]);
  });
});
