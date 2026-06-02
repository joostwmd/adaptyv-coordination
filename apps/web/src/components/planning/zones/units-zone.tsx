import { useMemo } from "react";

import type { Task } from "@/domain/task/types";
import { getCapacityStatus } from "@/domain/work-unit";
import { usePlanningBoard } from "@/hooks/usePlanningBoard";
import { usePlanningStore } from "@/stores/usePlanningStore";

import { DraggableWorkUnit } from "../dnd/draggable-work-unit";
import { SiblingUnitDropZone } from "../dnd/draggable-task-row";
import {
  AnimatedBoardItem,
  AnimatedBoardList,
} from "./animated-board-item";
import { ZoneShell } from "./zone-shell";

type UnitsZoneProps = {
  onTaskOpen: (task: Task) => void;
};

export function UnitsZone({ onTaskOpen }: UnitsZoneProps) {
  const board = usePlanningBoard();
  const tasks = usePlanningStore((state) => state.tasks);
  const splitWorkUnit = usePlanningStore((state) => state.splitWorkUnit);

  const overflowByUnitId = useMemo(() => {
    const map = new Map<string, boolean>();
    for (const workUnit of board.unscheduledWorkUnits) {
      const memberTasks = tasks.filter((task) => workUnit.taskIds.includes(task.id));
      map.set(workUnit.id, !getCapacityStatus(workUnit, memberTasks).withinCapacity);
    }
    return map;
  }, [board.unscheduledWorkUnits, tasks]);

  return (
    <ZoneShell
      title="Units"
      description="Draft batches not yet scheduled"
      count={board.unscheduledWorkUnits.length}
    >
      <AnimatedBoardList className="space-y-4">
        {board.unscheduledWorkUnits.length === 0 ? (
          <p className="text-xs text-muted-foreground">No draft units.</p>
        ) : (
          board.siblingGroups.map((group) => (
            <div key={group[0]?.workUnitKey ?? group[0]?.id} className="space-y-3">
              {group.length > 1 ? (
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Sibling set ({group.length})
                </p>
              ) : null}
              {group.map((workUnit) => {
                const isOverflow = overflowByUnitId.get(workUnit.id) ?? false;
                const isSiblingSet = group.length > 1;

                const card = (
                  <DraggableWorkUnit
                    workUnit={workUnit}
                    onTaskOpen={onTaskOpen}
                    showSplitBadge={isOverflow}
                    onSplit={() => splitWorkUnit(workUnit.id)}
                    layoutId={`unit-${workUnit.id}`}
                    enableSiblingTaskDrag={isSiblingSet}
                  />
                );

                return (
                  <AnimatedBoardItem key={workUnit.id} id={workUnit.id}>
                    {isSiblingSet ? (
                      <SiblingUnitDropZone
                        workUnitId={workUnit.id}
                        workUnitKey={workUnit.workUnitKey}
                      >
                        {card}
                      </SiblingUnitDropZone>
                    ) : (
                      card
                    )}
                  </AnimatedBoardItem>
                );
              })}
            </div>
          ))
        )}
      </AnimatedBoardList>
    </ZoneShell>
  );
}
