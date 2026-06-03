import { useMemo } from "react";

import {
  deriveTicketExecutionStatus,
  type TicketExecutionStatus,
} from "@/domain/tickets/execution-status";
import { usePlanningStore } from "@/stores/usePlanningStore";

export function useTicketExecution(workUnitId: string) {
  const allTasks = usePlanningStore((state) => state.tasks);
  const workUnits = usePlanningStore((state) => state.workUnits);

  const tasks = useMemo(() => {
    const workUnit = workUnits.find((wu) => wu.id === workUnitId);
    if (!workUnit) return [];
    const taskIds = new Set(workUnit.taskIds);
    return allTasks.filter((task) => taskIds.has(task.id));
  }, [allTasks, workUnits, workUnitId]);

  const sendTicketToLabOs = usePlanningStore((state) => state.sendTicketToLabOs);
  const completeWorkUnitTasks = usePlanningStore((state) => state.completeWorkUnitTasks);
  const failWorkUnitTasks = usePlanningStore((state) => state.failWorkUnitTasks);

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
