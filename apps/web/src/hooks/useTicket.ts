import { useMemo } from "react";

import type { PriorityScore } from "@/domain/priority";
import type { Task } from "@/domain/task/types";
import type { Ticket } from "@/domain/ticket/types";
import type { WorkUnit } from "@/domain/work-unit/types";
import {
  countExperimentsInWorkUnit,
  getExperimentsInWorkUnit,
  getWorkUnitTemplateLabel,
} from "@/domain/planning/display";
import type { ExperimentSummary } from "@/types";
import {
  useEnrichedTasks,
  type EnrichedPlanningTask,
} from "@/hooks/usePlanningTask";
import { useExperimentsById } from "@/hooks/useExperimentsById";
import { usePlanningBoardStore } from "@/stores/planning/usePlanningBoardStore";
import { usePrototypeStore } from "@/stores/usePrototypeStore";
import type { StaffMember } from "@/types";

export function useTicketByWorkUnit(workUnitId: string | undefined): Ticket | null {
  return usePlanningBoardStore((state) =>
    workUnitId
      ? (state.tickets.find((ticket) => ticket.workUnitId === workUnitId) ?? null)
      : null,
  );
}

export type EnrichedTicket = {
  ticket: Ticket;
  workUnit: WorkUnit;
  tasks: Task[];
  enrichedTasks: EnrichedPlanningTask[];
  assignee: StaffMember | null;
  experimentCount: number;
  experiments: ExperimentSummary[];
  templateLabel: string;
  priority: PriorityScore | null;
};

export function useTicketView(ticket: Ticket | null): EnrichedTicket | null {
  const allTasks = usePlanningBoardStore((state) => state.tasks);
  const workUnits = usePlanningBoardStore((state) => state.workUnits);
  const staff = usePrototypeStore((state) => state.staff);
  const experimentsById = useExperimentsById();
  const getWorkUnitPriority = usePlanningBoardStore((state) => state.getWorkUnitPriority);

  const workUnit = useMemo(() => {
    if (!ticket) return null;
    return workUnits.find((wu) => wu.id === ticket.workUnitId) ?? null;
  }, [ticket, workUnits]);

  const tasks = useMemo(() => {
    if (!workUnit) return [];
    return allTasks.filter((t) => workUnit.taskIds.includes(t.id));
  }, [allTasks, workUnit]);

  const enrichedTasks = useEnrichedTasks(tasks);

  return useMemo(() => {
    if (!ticket || !workUnit) return null;

    const assignee = staff.find((m) => m.id === ticket.assigneeId) ?? null;
    const priority = getWorkUnitPriority(workUnit.id);
    const driver = priority
      ? enrichedTasks.find((e) => e.task.id === priority.driverTaskId)
      : undefined;

    return {
      ticket,
      workUnit,
      tasks,
      enrichedTasks,
      assignee,
      experimentCount: countExperimentsInWorkUnit(tasks, experimentsById),
      experiments: getExperimentsInWorkUnit(tasks, experimentsById),
      templateLabel: getWorkUnitTemplateLabel(workUnit),
      priority: driver?.priority ?? null,
    };
  }, [
    ticket,
    workUnit,
    tasks,
    enrichedTasks,
    staff,
    experimentsById,
    getWorkUnitPriority,
  ]);
}
