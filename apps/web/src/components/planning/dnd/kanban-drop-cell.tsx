import { useDroppable } from "@dnd-kit/react";
import { cn } from "@adaptyv-coordination/ui/lib/utils";

import type { KanbanDropData } from "../dnd/types";

type KanbanDropCellProps = {
  staffId: string;
  day: string;
  children: React.ReactNode;
  className?: string;
};

export function KanbanDropCell({
  staffId,
  day,
  children,
  className,
}: KanbanDropCellProps) {
  const { ref, isDropTarget } = useDroppable({
    id: `kanban:${staffId}:${day}`,
    accept: ["unit", "ticket"],
    data: {
      kind: "kanban-cell",
      staffId,
      day,
    } satisfies KanbanDropData,
  });

  return (
    <div
      ref={ref}
      className={cn(
        "min-h-28 rounded-md border border-dashed p-2 transition-colors",
        isDropTarget && "border-primary/60 bg-primary/5",
        className,
      )}
    >
      {children}
    </div>
  );
}
