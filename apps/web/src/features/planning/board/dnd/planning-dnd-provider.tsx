import { useState, type ReactNode } from "react";
import { DragDropProvider, DragOverlay } from "@dnd-kit/react";

import {
  applyPlanningDropAction,
  resolvePlanningDrop,
  type PlanningDropData,
  type PlanningDragData,
} from "@/domain/planning/dnd-policy";
import type { Ticket } from "@/domain/ticket/types";
import type { WorkUnit } from "@/domain/work-unit/types";
import { usePlanningBoardStore } from "@/stores/planning/usePlanningBoardStore";

import { TicketCard } from "@/features/planning/cards/ticket-card";
import { WorkUnitCard } from "@/features/planning/cards/work-unit-card";
import { isPlanningDragData } from "./types";

type PlanningDndProviderProps = {
  children: ReactNode;
};

export function PlanningDndProvider({ children }: PlanningDndProviderProps) {
  const createTicket = usePlanningBoardStore((state) => state.createTicket);
  const updateTicket = usePlanningBoardStore((state) => state.updateTicket);
  const unscheduleTicket = usePlanningBoardStore((state) => state.unscheduleTicket);
  const revertTicketToQueue = usePlanningBoardStore((state) => state.revertTicketToQueue);
  const dissolveWorkUnit = usePlanningBoardStore((state) => state.dissolveWorkUnit);
  const addTaskToWorkUnit = usePlanningBoardStore((state) => state.addTaskToWorkUnit);
  const removeTaskFromWorkUnit = usePlanningBoardStore(
    (state) => state.removeTaskFromWorkUnit,
  );

  const dropActions = {
    createTicket,
    updateTicket,
    unscheduleTicket,
    revertTicketToQueue,
    dissolveWorkUnit,
    removeTaskFromWorkUnit,
    addTaskToWorkUnit,
  };

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
          const workUnit = usePlanningBoardStore
            .getState()
            .workUnits.find((unit) => unit.id === sourceData.workUnitId);
          setActiveDrag({ kind: "unit", workUnit });
          return;
        }

        if (sourceData.kind === "ticket") {
          const sourceId = String(event.operation.source?.id ?? "");
          const ticket =
            usePlanningBoardStore.getState().tickets.find((item) => item.id === sourceId) ??
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
        const action = resolvePlanningDrop(String(source.id), sourceData, targetData);
        applyPlanningDropAction(action, dropActions);
      }}
    >
      {children}
      <DragOverlay>
        {activeDrag?.kind === "unit" && activeDrag.workUnit ? (
          <div className="pointer-events-none w-[min(100%,320px)] rotate-1 opacity-95 shadow-lg">
            <WorkUnitCard workUnit={activeDrag.workUnit} />
          </div>
        ) : null}
        {activeDrag?.kind === "ticket" && activeDrag.ticket ? (
          <div className="pointer-events-none w-[min(100%,320px)] rotate-1 opacity-95 shadow-lg">
            <TicketCard ticket={activeDrag.ticket} />
          </div>
        ) : null}
      </DragOverlay>
    </DragDropProvider>
  );
}
