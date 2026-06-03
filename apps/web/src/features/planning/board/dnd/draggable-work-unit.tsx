import { useDraggable } from "@dnd-kit/react";
import { cn } from "@adaptyv-coordination/ui/lib/utils";

import type { Task } from "@/domain/task/types";
import type { WorkUnit } from "@/domain/work-unit/types";

import { WorkUnitCard } from "@/features/planning/cards/work-unit-card";
import { DraggableTaskRow } from "./draggable-task-row";
import type { PlanningDragData } from "./types";

type DraggableWorkUnitProps = {
  workUnit: WorkUnit;
  variant?: "default" | "suggested";
  className?: string;
  dragDisabled?: boolean;
  layoutId?: string;
  enableSiblingTaskDrag?: boolean;
};

export function DraggableWorkUnit({
  workUnit,
  variant = "default",
  className,
  dragDisabled = false,
  layoutId,
  enableSiblingTaskDrag = false,
}: DraggableWorkUnitProps) {
  const isDraggable = !dragDisabled && variant !== "suggested";
  const { ref, isDragging } = useDraggable({
    id: `unit:${workUnit.id}`,
    type: "unit",
    disabled: !isDraggable,
    data: {
      kind: "unit",
      workUnitId: workUnit.id,
      workUnitKey: workUnit.workUnitKey,
    } satisfies PlanningDragData,
  });

  return (
    <div
      ref={ref}
      className={cn(
        isDraggable && "cursor-grab active:cursor-grabbing",
        isDragging && "cursor-grabbing opacity-40",
        className,
      )}
    >
      <WorkUnitCard
        workUnit={workUnit}
        variant={variant}
        layoutId={layoutId ?? `unit-${workUnit.id}`}
        renderTask={
          enableSiblingTaskDrag
            ? (task) => (
                <DraggableTaskRow
                  task={task}
                  workUnitKey={workUnit.workUnitKey}
                  dragDisabled={false}
                  layoutId={`task-${task.id}`}
                />
              )
            : undefined
        }
      />
    </div>
  );
}
