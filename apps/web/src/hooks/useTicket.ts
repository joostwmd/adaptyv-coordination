import { useMemo } from "react";

import type { PriorityScore } from "@/domain/priority";
import type { Task } from "@/domain/task/types";
import type { Ticket } from "@/domain/ticket/types";
import type { WorkUnit } from "@/domain/work-unit/types";
import {
  countExperimentsInWorkUnit,
  getExperimentsInWorkUnit,
  getWorkUnitTemplateLabel,
} from "@/components/planning/utils";
import type { ExperimentSummary } from "@/types";
import {
  useEnrichedTasks,
  useExperimentsById,
  type EnrichedPlanningTask,
} from "@/hooks/usePlanningTask";
import { usePlanningStore } from "@/stores/usePlanningStore";
import { usePrototypeStore } from "@/stores/usePrototypeStore";
import type { StaffMember } from "@/types";

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
  const allTasks = usePlanningStore((s) => s.tasks);
  const workUnits = usePlanningStore((s) => s.workUnits);
  const staff = usePrototypeStore((s) => s.staff);
  const experimentsById = useExperimentsById();
  const getWorkUnitPriority = usePlanningStore((s) => s.getWorkUnitPriority);

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
