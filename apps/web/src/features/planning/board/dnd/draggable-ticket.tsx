import { useDraggable } from "@dnd-kit/react";
import { cn } from "@adaptyv-coordination/ui/lib/utils";

import type { Ticket } from "@/domain/ticket/types";

import { TicketCard } from "@/features/planning/cards/ticket-card";
import type { PlanningDragData } from "./types";

type DraggableTicketProps = {
  ticket: Ticket;
  layoutId?: string;
};

export function DraggableTicket({ ticket, layoutId }: DraggableTicketProps) {
  const { ref, isDragging } = useDraggable({
    id: ticket.id,
    type: "ticket",
    data: {
      kind: "ticket",
      workUnitId: ticket.workUnitId,
    } satisfies PlanningDragData,
  });

  return (
    <div
      ref={ref}
      className={cn(
        "cursor-grab active:cursor-grabbing",
        isDragging && "cursor-grabbing opacity-40",
      )}
    >
      <TicketCard ticket={ticket} layoutId={layoutId ?? `ticket-${ticket.id}`} />
    </div>
  );
}
