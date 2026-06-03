import { useMemo } from "react";

import {
  deriveTicketExecutionStatus,
  type TicketExecutionStatus,
} from "@/domain/tickets/execution-status";
import { usePlanningBoardStore } from "@/stores/planning/usePlanningBoardStore";

export function useTicketExecution(workUnitId: string) {
  const allTasks = usePlanningBoardStore((state) => state.tasks);
  const workUnits = usePlanningBoardStore((state) => state.workUnits);

  const tasks = useMemo(() => {
    const workUnit = workUnits.find((wu) => wu.id === workUnitId);
    if (!workUnit) return [];
    const taskIds = new Set(workUnit.taskIds);
    return allTasks.filter((task) => taskIds.has(task.id));
  }, [allTasks, workUnits, workUnitId]);

  const sendTicketToLabOs = usePlanningBoardStore((state) => state.sendTicketToLabOs);
  const completeWorkUnitTasks = usePlanningBoardStore((state) => state.completeWorkUnitTasks);
  const failWorkUnitTasks = usePlanningBoardStore((state) => state.failWorkUnitTasks);

  const status: TicketExecutionStatus = useMemo(
    () => deriveTicketExecutionStatus(tasks),
    [tasks],
  );

  return {
    status,
    tasks,
    sendToLabOs: () => sendTicketToLabOs(workUnitId),
    complete: () => completeWorkUnitTasks(workUnitId),
    fail: () => failWorkUnitTasks(workUnitId),
  };
}
