import type { Task } from "@/domain/task/types";
import type { Ticket } from "@/domain/ticket/types";
import { groupTasksByWorkUnitKey } from "@/domain/work-unit/grouping";
import type { WorkUnit } from "@/domain/work-unit/types";

export type PlanningBoardState = {
  tasks: Task[];
  workUnits: WorkUnit[];
  tickets: Ticket[];
};

export type PoolGroup = {
  workUnitKey: string;
  tasks: Task[];
};

export type AttachItem = {
  task: Task;
  candidateUnits: WorkUnit[];
};

export type ClassifiedQueue = {
  pool: PoolGroup[];
  attach: AttachItem[];
  alone: Task[];
};

export function getUnscheduledWorkUnits(
  workUnits: WorkUnit[],
  tickets: Ticket[],
): WorkUnit[] {
  const scheduledIds = new Set(tickets.map((ticket) => ticket.workUnitId));
  return workUnits.filter((workUnit) => !scheduledIds.has(workUnit.id));
}

export function classifyReadyTasks(
  tasks: Task[],
  unscheduledWorkUnits: WorkUnit[],
): ClassifiedQueue {
  const ready = tasks.filter(
    (task) => task.readiness === "ready" && !task.workUnitId,
  );
  const groups = groupTasksByWorkUnitKey(ready);

  const unitsByKey = new Map<string, WorkUnit[]>();
  for (const workUnit of unscheduledWorkUnits) {
    const list = unitsByKey.get(workUnit.workUnitKey) ?? [];
    list.push(workUnit);
    unitsByKey.set(workUnit.workUnitKey, list);
  }

  const pool: PoolGroup[] = [];
  const attach: AttachItem[] = [];
  const alone: Task[] = [];

  for (const [workUnitKey, groupTasks] of groups) {
    const candidates = unitsByKey.get(workUnitKey) ?? [];
    if (candidates.length > 0) {
      for (const task of groupTasks) {
        attach.push({ task, candidateUnits: candidates });
      }
    } else if (groupTasks.length >= 2) {
      pool.push({ workUnitKey, tasks: groupTasks });
    } else if (groupTasks[0]) {
      alone.push(groupTasks[0]);
    }
  }

  return { pool, attach, alone };
}

export function getSiblingUnitGroups(unscheduledWorkUnits: WorkUnit[]): WorkUnit[][] {
  const byKey = new Map<string, WorkUnit[]>();
  for (const workUnit of unscheduledWorkUnits) {
    const list = byKey.get(workUnit.workUnitKey) ?? [];
    list.push(workUnit);
    byKey.set(workUnit.workUnitKey, list);
  }
  return [...byKey.values()];
}

export function getTicketsByPersonForDay(
  tickets: Ticket[],
  day: string,
  staffIds: string[],
): Record<string, Ticket[]> {
  const byPerson: Record<string, Ticket[]> = Object.fromEntries(
    staffIds.map((id) => [id, [] as Ticket[]]),
  );

  for (const ticket of tickets) {
    if (ticket.scheduledDay !== day) continue;
    const column = byPerson[ticket.assigneeId];
    if (column) column.push(ticket);
  }

  return byPerson;
}

export function getBlockedTasks(tasks: Task[]): Task[] {
  return tasks.filter((task) => task.readiness === "blocked");
}

export function getWaitingUpstreamTasks(tasks: Task[]): Task[] {
  return tasks.filter((task) => task.readiness === "waiting_upstream");
}

export function getRerunTasks(tasks: Task[]): Task[] {
  return tasks.filter((task) => task.origin === "rerun");
}
