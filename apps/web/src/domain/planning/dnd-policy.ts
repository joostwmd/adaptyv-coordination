export type PlanningDragKind = "unit" | "ticket" | "task";

export type PlanningDragData = {
  kind: PlanningDragKind;
  workUnitKey?: string;
  workUnitId?: string;
  staffId?: string;
  day?: string;
};

export type KanbanDropData = {
  kind: "kanban-cell";
  staffId: string;
  day: string;
};

export type SiblingDropData = {
  kind: "sibling-unit";
  workUnitId: string;
  workUnitKey: string;
};

export type ZoneDropKind = "units-zone" | "queue-zone";

export type ZoneDropData = {
  kind: ZoneDropKind;
};

export type PlanningDropData = KanbanDropData | SiblingDropData | ZoneDropData;

export function isKanbanDropData(
  data: PlanningDragData | PlanningDropData | undefined,
): data is KanbanDropData {
  return data?.kind === "kanban-cell";
}

export function isPlanningDragData(
  data: PlanningDragData | PlanningDropData | undefined,
): data is PlanningDragData {
  return data?.kind === "unit" || data?.kind === "ticket" || data?.kind === "task";
}

export function isSiblingDropData(
  data: PlanningDragData | PlanningDropData | undefined,
): data is SiblingDropData {
  return data?.kind === "sibling-unit";
}

export function isUnitsZoneDropData(
  data: PlanningDragData | PlanningDropData | undefined,
): data is ZoneDropData {
  return data?.kind === "units-zone";
}

export function isQueueZoneDropData(
  data: PlanningDragData | PlanningDropData | undefined,
): data is ZoneDropData {
  return data?.kind === "queue-zone";
}

export type PlanningDropAction =
  | { type: "schedule"; workUnitId: string; staffId: string; day: string }
  | { type: "reschedule"; ticketId: string; staffId: string; day: string }
  | { type: "unschedule"; ticketId: string }
  | { type: "revertToQueue"; ticketId: string }
  | { type: "dissolve"; workUnitId: string }
  | {
      type: "moveTaskToSibling";
      taskId: string;
      workUnitId: string;
      workUnitKey: string;
    }
  | { type: "noop" };

export function resolvePlanningDrop(
  sourceId: string,
  sourceData: PlanningDragData | undefined,
  targetData: PlanningDragData | PlanningDropData | undefined,
): PlanningDropAction {
  if (!sourceData) return { type: "noop" };

  if (sourceData.kind === "unit" && isKanbanDropData(targetData)) {
    if (!sourceData.workUnitId) return { type: "noop" };
    return {
      type: "schedule",
      workUnitId: sourceData.workUnitId,
      staffId: targetData.staffId,
      day: targetData.day,
    };
  }

  if (sourceData.kind === "ticket" && isKanbanDropData(targetData)) {
    return {
      type: "reschedule",
      ticketId: sourceId,
      staffId: targetData.staffId,
      day: targetData.day,
    };
  }

  if (sourceData.kind === "ticket" && isUnitsZoneDropData(targetData)) {
    return { type: "unschedule", ticketId: sourceId };
  }

  if (sourceData.kind === "ticket" && isQueueZoneDropData(targetData)) {
    return { type: "revertToQueue", ticketId: sourceId };
  }

  if (sourceData.kind === "unit" && isQueueZoneDropData(targetData)) {
    if (!sourceData.workUnitId) return { type: "noop" };
    return { type: "dissolve", workUnitId: sourceData.workUnitId };
  }

  if (sourceData.kind === "task" && isSiblingDropData(targetData)) {
    if (sourceData.workUnitKey !== targetData.workUnitKey) return { type: "noop" };
    return {
      type: "moveTaskToSibling",
      taskId: sourceId,
      workUnitId: targetData.workUnitId,
      workUnitKey: targetData.workUnitKey,
    };
  }

  return { type: "noop" };
}

export type PlanningDropStoreActions = {
  createTicket: (workUnitId: string, assigneeId: string, scheduledDay: string) => void;
  updateTicket: (
    ticketId: string,
    updates: { assigneeId: string; scheduledDay: string },
  ) => void;
  unscheduleTicket: (ticketId: string) => void;
  revertTicketToQueue: (ticketId: string) => void;
  dissolveWorkUnit: (workUnitId: string) => void;
  removeTaskFromWorkUnit: (taskId: string) => void;
  addTaskToWorkUnit: (taskId: string, workUnitId: string) => void;
};

export function applyPlanningDropAction(
  action: PlanningDropAction,
  store: PlanningDropStoreActions,
): void {
  switch (action.type) {
    case "schedule":
      store.createTicket(action.workUnitId, action.staffId, action.day);
      return;
    case "reschedule":
      store.updateTicket(action.ticketId, {
        assigneeId: action.staffId,
        scheduledDay: action.day,
      });
      return;
    case "unschedule":
      store.unscheduleTicket(action.ticketId);
      return;
    case "revertToQueue":
      store.revertTicketToQueue(action.ticketId);
      return;
    case "dissolve":
      store.dissolveWorkUnit(action.workUnitId);
      return;
    case "moveTaskToSibling":
      store.removeTaskFromWorkUnit(action.taskId);
      store.addTaskToWorkUnit(action.taskId, action.workUnitId);
      return;
    case "noop":
      return;
  }
}
