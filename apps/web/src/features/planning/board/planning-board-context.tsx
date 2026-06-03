import { createContext, useContext, type ReactNode } from "react";

import { usePlanningBoard } from "@/hooks/usePlanningBoard";

export type PlanningBoardViewModel = ReturnType<typeof usePlanningBoard>;

export type DayBoardViewModel = Pick<
  PlanningBoardViewModel,
  "currentDay" | "kanbanRoster" | "ticketsByPerson"
>;

const PlanningBoardContext = createContext<PlanningBoardViewModel | null>(null);

type PlanningBoardProviderProps = {
  children: ReactNode;
};

export function PlanningBoardProvider({ children }: PlanningBoardProviderProps) {
  const board = usePlanningBoard();
  return (
    <PlanningBoardContext.Provider value={board}>{children}</PlanningBoardContext.Provider>
  );
}

export function usePlanningBoardContext(): PlanningBoardViewModel {
  const board = useContext(PlanningBoardContext);
  if (!board) {
    throw new Error("usePlanningBoardContext must be used within PlanningBoardProvider");
  }
  return board;
}

export function useDayBoardViewModel(): DayBoardViewModel {
  const board = usePlanningBoardContext();
  return {
    currentDay: board.currentDay,
    kanbanRoster: board.kanbanRoster,
    ticketsByPerson: board.ticketsByPerson,
  };
}
