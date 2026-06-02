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
  return (
    data?.kind === "unit" ||
    data?.kind === "ticket" ||
    data?.kind === "task"
  );
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
