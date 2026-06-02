import { useDraggable } from "@dnd-kit/react";
import { cn } from "@adaptyv-coordination/ui/lib/utils";

import type { Task } from "@/domain/task/types";
import type { WorkUnit } from "@/domain/work-unit/types";

import { DraggableTaskRow } from "./draggable-task-row";
import { WorkUnitCard } from "../work-unit-card";
import type { PlanningDragData } from "./types";

type DraggableWorkUnitProps = {
  workUnit: WorkUnit;
  onTaskOpen: (task: Task) => void;
  variant?: "default" | "suggested";
  showSplitBadge?: boolean;
  onSplit?: () => void;
  className?: string;
  dragDisabled?: boolean;
  layoutId?: string;
  enableSiblingTaskDrag?: boolean;
};

export function DraggableWorkUnit({
  workUnit,
  onTaskOpen,
  variant = "default",
  showSplitBadge,
  onSplit,
  className,
  dragDisabled = false,
  layoutId,
  enableSiblingTaskDrag = false,
}: DraggableWorkUnitProps) {
  const { ref, isDragging } = useDraggable({
    id: `unit:${workUnit.id}`,
    disabled: dragDisabled || variant === "suggested",
    data: {
      kind: "unit",
      workUnitId: workUnit.id,
      workUnitKey: workUnit.workUnitKey,
    } satisfies PlanningDragData,
  });

  return (
    <div ref={ref} className={cn(isDragging && "opacity-40", className)}>
      <WorkUnitCard
        workUnit={workUnit}
        variant={variant}
        onTaskOpen={onTaskOpen}
        showSplitBadge={showSplitBadge}
        onSplit={onSplit}
        layoutId={layoutId ?? `unit-${workUnit.id}`}
        renderTask={
          enableSiblingTaskDrag
            ? (task) => (
                <DraggableTaskRow
                  task={task}
                  workUnitKey={workUnit.workUnitKey}
                  onOpen={onTaskOpen}
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
