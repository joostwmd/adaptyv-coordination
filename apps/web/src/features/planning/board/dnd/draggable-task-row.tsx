import type { ReactNode } from "react";
import { useDraggable } from "@dnd-kit/react";
import { useDroppable } from "@dnd-kit/react";
import { cn } from "@adaptyv-coordination/ui/lib/utils";

import type { Task } from "@/domain/task/types";

import { TaskCard } from "@/components/task/task-card";
import type { PlanningDragData, SiblingDropData } from "./types";

type DraggableTaskRowProps = {
  task: Task;
  workUnitKey: string;
  dragDisabled?: boolean;
  layoutId?: string;
};

export function DraggableTaskRow({
  task,
  workUnitKey,
  dragDisabled = true,
  layoutId,
}: DraggableTaskRowProps) {
  const { ref: dragRef, isDragging } = useDraggable({
    id: task.id,
    type: "task",
    disabled: dragDisabled,
    data: {
      kind: "task",
      workUnitKey,
    } satisfies PlanningDragData,
  });

  return (
    <div
      ref={dragRef}
      className={cn(
        !dragDisabled && "cursor-grab active:cursor-grabbing",
        isDragging && "cursor-grabbing opacity-40",
      )}
    >
      <TaskCard
        task={task}
        variant="compact"
        layoutId={layoutId ?? `task-${task.id}`}
      />
    </div>
  );
}

type SiblingUnitDropZoneProps = {
  workUnitId: string;
  workUnitKey: string;
  children: ReactNode;
  className?: string;
};

export function SiblingUnitDropZone({
  workUnitId,
  workUnitKey,
  children,
  className,
}: SiblingUnitDropZoneProps) {
  const { ref, isDropTarget } = useDroppable({
    id: `sibling-unit:${workUnitId}`,
    accept: (source) => {
      if (source.type !== "task") return false;
      const data = source.data as PlanningDragData | undefined;
      return data?.workUnitKey === workUnitKey;
    },
    data: {
      kind: "sibling-unit",
      workUnitId,
      workUnitKey,
    } satisfies SiblingDropData,
  });

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-md transition-colors",
        isDropTarget && "ring-2 ring-primary/40 ring-offset-2 ring-offset-background",
        className,
      )}
    >
      {children}
    </div>
  );
}
