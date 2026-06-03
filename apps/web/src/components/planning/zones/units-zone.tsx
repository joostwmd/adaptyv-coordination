import { useMemo } from "react";
import { Button } from "@adaptyv-coordination/ui/components/button";

import { getCapacityStatus } from "@/domain/work-unit";
import { usePlanningBoard } from "@/hooks/usePlanningBoard";
import { usePlanningStore } from "@/stores/usePlanningStore";

import { DraggableWorkUnit } from "../dnd/draggable-work-unit";
import { SiblingUnitDropZone } from "../dnd/draggable-task-row";
import { ZoneDropTarget } from "../dnd/zone-drop-target";
import { PlanningSuggestionShell } from "../primitives/planning-suggestion-shell";
import {
  AnimatedBoardItem,
  AnimatedBoardList,
} from "./animated-board-item";
import { ZoneShell } from "./zone-shell";

export function UnitsZone() {
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
      <ZoneDropTarget
        zone="units-zone"
        accept={(source) => source.type === "ticket"}
        activeHint="Drop to unschedule"
      >
        <AnimatedBoardList className="space-y-4">
          {board.unscheduledWorkUnits.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No draft units. Drop a scheduled ticket here to unschedule.
            </p>
          ) : (
          board.siblingGroups.map((group) => {
            const isSiblingSet = group.length > 1;
            const groupKey = group[0]?.workUnitKey ?? group[0]?.id;

            const units = group.map((workUnit) => {
              const isOverflow = overflowByUnitId.get(workUnit.id) ?? false;

              const card = (
                <DraggableWorkUnit
                  workUnit={workUnit}
                  layoutId={`unit-${workUnit.id}`}
                  enableSiblingTaskDrag={isSiblingSet}
                />
              );

              const wrappedCard = isSiblingSet ? (
                <SiblingUnitDropZone
                  workUnitId={workUnit.id}
                  workUnitKey={workUnit.workUnitKey}
                >
                  {card}
                </SiblingUnitDropZone>
              ) : (
                card
              );

              return (
                <AnimatedBoardItem key={workUnit.id} id={workUnit.id}>
                  {isOverflow ? (
                    <PlanningSuggestionShell
                      label="Over capacity — split"
                      action={
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => splitWorkUnit(workUnit.id)}
                        >
                          Split unit
                        </Button>
                      }
                    >
                      {wrappedCard}
                    </PlanningSuggestionShell>
                  ) : (
                    wrappedCard
                  )}
                </AnimatedBoardItem>
              );
            });

            if (!isSiblingSet) {
              return <div key={groupKey}>{units}</div>;
            }

            return (
              <PlanningSuggestionShell
                key={groupKey}
                label={`Sibling set (${group.length})`}
              >
                <div className="space-y-3">{units}</div>
              </PlanningSuggestionShell>
            );
          })
        )}
        </AnimatedBoardList>
      </ZoneDropTarget>
    </ZoneShell>
  );
}
