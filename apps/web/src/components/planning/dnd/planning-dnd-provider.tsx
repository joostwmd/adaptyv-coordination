import { useState, type ReactNode } from "react";
import { DragDropProvider, DragOverlay } from "@dnd-kit/react";

import type { Task } from "@/domain/task/types";
import type { Ticket } from "@/domain/ticket/types";
import type { WorkUnit } from "@/domain/work-unit/types";
import { usePlanningStore } from "@/stores/usePlanningStore";

import { TicketCard } from "../ticket-card";
import { WorkUnitCard } from "../work-unit-card";
import {
  isKanbanDropData,
  isPlanningDragData,
  isQueueZoneDropData,
  isSiblingDropData,
  isUnitsZoneDropData,
  type PlanningDropData,
  type PlanningDragData,
} from "./types";

type PlanningDndProviderProps = {
  children: ReactNode;
  onTaskOpen: (task: Task) => void;
};

export function PlanningDndProvider({
  children,
  onTaskOpen,
}: PlanningDndProviderProps) {
  const createTicket = usePlanningStore((state) => state.createTicket);
  const updateTicket = usePlanningStore((state) => state.updateTicket);
  const unscheduleTicket = usePlanningStore((state) => state.unscheduleTicket);
  const revertTicketToQueue = usePlanningStore((state) => state.revertTicketToQueue);
  const dissolveWorkUnit = usePlanningStore((state) => state.dissolveWorkUnit);
  const addTaskToWorkUnit = usePlanningStore((state) => state.addTaskToWorkUnit);
  const removeTaskFromWorkUnit = usePlanningStore(
    (state) => state.removeTaskFromWorkUnit,
  );

  const [activeDrag, setActiveDrag] = useState<{
    kind: PlanningDragData["kind"];
    workUnit?: WorkUnit;
    ticket?: Ticket;
  } | null>(null);

  return (
    <DragDropProvider
      onDragStart={(event) => {
        const sourceData = event.operation.source?.data as PlanningDragData | undefined;
        if (!sourceData || !isPlanningDragData(sourceData)) {
          setActiveDrag(null);
          return;
        }

        if (sourceData.kind === "unit" && sourceData.workUnitId) {
          const workUnit = usePlanningStore
            .getState()
            .workUnits.find((unit) => unit.id === sourceData.workUnitId);
          setActiveDrag({ kind: "unit", workUnit });
          return;
        }

        if (sourceData.kind === "ticket") {
          const sourceId = String(event.operation.source?.id ?? "");
          const ticket =
            usePlanningStore.getState().tickets.find((item) => item.id === sourceId) ??
            null;
          setActiveDrag({ kind: "ticket", ticket: ticket ?? undefined });
          return;
        }

        setActiveDrag({ kind: sourceData.kind });
      }}
      onDragEnd={(event) => {
        setActiveDrag(null);
        if (event.canceled) return;

        const source = event.operation.source;
        const target = event.operation.target;
        if (!source || !target) return;

        const sourceData = source.data as PlanningDragData | undefined;
        const targetData = target.data as PlanningDragData | PlanningDropData | undefined;

        if (sourceData?.kind === "unit" && isKanbanDropData(targetData)) {
          if (!sourceData.workUnitId) return;
          createTicket(sourceData.workUnitId, targetData.staffId, targetData.day);
          return;
        }

        if (sourceData?.kind === "ticket" && isKanbanDropData(targetData)) {
          updateTicket(String(source.id), {
            assigneeId: targetData.staffId,
            scheduledDay: targetData.day,
          });
          return;
        }

        if (sourceData?.kind === "ticket" && isUnitsZoneDropData(targetData)) {
          unscheduleTicket(String(source.id));
          return;
        }

        if (sourceData?.kind === "ticket" && isQueueZoneDropData(targetData)) {
          revertTicketToQueue(String(source.id));
          return;
        }

        if (sourceData?.kind === "unit" && isQueueZoneDropData(targetData)) {
          if (!sourceData.workUnitId) return;
          dissolveWorkUnit(sourceData.workUnitId);
          return;
        }

        if (sourceData?.kind === "task" && isSiblingDropData(targetData)) {
          if (sourceData.workUnitKey !== targetData.workUnitKey) return;
          const taskId = String(source.id);
          removeTaskFromWorkUnit(taskId);
          addTaskToWorkUnit(taskId, targetData.workUnitId);
        }
      }}
    >
      {children}
      <DragOverlay>
        {activeDrag?.kind === "unit" && activeDrag.workUnit ? (
          <div className="pointer-events-none w-[min(100%,320px)] rotate-1 opacity-95 shadow-lg">
            <WorkUnitCard
              workUnit={activeDrag.workUnit}
              onTaskOpen={onTaskOpen}
            />
          </div>
        ) : null}
        {activeDrag?.kind === "ticket" && activeDrag.ticket ? (
          <div className="pointer-events-none w-[min(100%,320px)] rotate-1 opacity-95 shadow-lg">
            <TicketCard ticket={activeDrag.ticket} onTaskOpen={onTaskOpen} />
          </div>
        ) : null}
      </DragOverlay>
    </DragDropProvider>
  );
}
