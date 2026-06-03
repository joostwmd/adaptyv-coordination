import { useShallow } from "zustand/react/shallow";

import { usePlanningBoardStore } from "@/stores/planning/usePlanningBoardStore";

export function usePlanningBoardActions() {
  return usePlanningBoardStore(
    useShallow((state) => ({
      createWorkUnitFromReadyTasks: state.createWorkUnitFromReadyTasks,
      createSplitUnitsFromReadyTasks: state.createSplitUnitsFromReadyTasks,
      addTaskToWorkUnit: state.addTaskToWorkUnit,
      splitWorkUnit: state.splitWorkUnit,
      createTicket: state.createTicket,
      updateTicket: state.updateTicket,
      unscheduleTicket: state.unscheduleTicket,
      revertTicketToQueue: state.revertTicketToQueue,
      dissolveWorkUnit: state.dissolveWorkUnit,
      removeTaskFromWorkUnit: state.removeTaskFromWorkUnit,
    })),
  );
}
