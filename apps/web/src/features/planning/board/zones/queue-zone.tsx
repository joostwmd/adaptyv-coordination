import { Button } from "@adaptyv-coordination/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@adaptyv-coordination/ui/components/dropdown-menu";

import { previewPoolGroup, previewSoloUnit } from "@/domain/planning/queue-actions";
import { useExperimentsById } from "@/hooks/useExperimentsById";
import { usePlanningBoardContext } from "@/features/planning/board/planning-board-context";
import { usePlanningBoardStore } from "@/stores/planning/usePlanningBoardStore";
import { usePlanningPreferencesStore } from "@/stores/planning/usePlanningPreferencesStore";

import { PlanningSuggestionShell } from "@/features/planning/suggestion-shell";
import { ZoneDropTarget } from "../dnd/zone-drop-target";
import { WorkUnitCard } from "@/features/planning/cards/work-unit-card";
import { TaskCard } from "@/entities/task/task-card";
import {
  AnimatedBoardItem,
  AnimatedBoardList,
} from "./animated-board-item";
import { QueueSubzone, ZoneShell } from "./zone-shell";

export function QueueZone() {
  const board = usePlanningBoardContext();
  const createWorkUnitFromReadyTasks = usePlanningBoardStore(
    (state) => state.createWorkUnitFromReadyTasks,
  );
  const createSplitUnitsFromReadyTasks = usePlanningBoardStore(
    (state) => state.createSplitUnitsFromReadyTasks,
  );
  const addTaskToWorkUnit = usePlanningBoardStore((state) => state.addTaskToWorkUnit);
  const weights = usePlanningPreferencesStore((state) => state.weights);
  const currentDay = usePlanningBoardStore((state) => state.currentDay);
  const experimentsById = useExperimentsById();

  const queuePreviewContext = { experimentsById, weights, currentDay };

  const queueCount =
    board.queue.pool.reduce((total, group) => total + group.tasks.length, 0) +
    board.queue.attach.length +
    board.queue.alone.length;

  return (
    <ZoneShell
      title="Queue"
      description="What could run together?"
      count={queueCount}
    >
      <ZoneDropTarget
        zone="queue-zone"
        accept={(source) => source.type === "unit" || source.type === "ticket"}
        activeHint="Drop to return tasks to the queue"
      >
      <div className="space-y-3">
        <QueueSubzone title="Pool" count={board.queue.pool.length}>
          <AnimatedBoardList className="space-y-3">
            {board.queue.pool.length === 0 ? (
              <p className="text-xs text-muted-foreground">No batchable groups.</p>
            ) : (
              board.queue.pool.map((group) => {
                const preview = previewPoolGroup(group.tasks, queuePreviewContext);
                const taskIds = group.tasks.map((task) => task.id);

                return (
                  <AnimatedBoardItem
                    key={group.workUnitKey}
                    id={`pool-${group.workUnitKey}`}
                    layoutId={`pool-${group.workUnitKey}`}
                  >
                    <PlanningSuggestionShell
                      label={preview.showSplitPreview ? "Over capacity — split" : undefined}
                      action={
                        preview.showSplitPreview ? (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => createSplitUnitsFromReadyTasks(taskIds)}
                          >
                            Split unit
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => createWorkUnitFromReadyTasks(taskIds)}
                          >
                            Create unit
                          </Button>
                        )
                      }
                    >
                      <WorkUnitCard
                        workUnit={preview.suggestedUnit}
                        variant="suggested"
                        showEyebrow={false}
                        layoutId={`pool-preview-${group.workUnitKey}`}
                      />
                      {preview.showSplitPreview &&
                      preview.splitPrimaryUnit &&
                      preview.splitSecondaryUnit ? (
                        <div className="grid gap-2">
                          <WorkUnitCard
                            workUnit={preview.splitPrimaryUnit}
                            variant="suggested"
                            previewLabel="Suggested 1/2"
                          />
                          <WorkUnitCard
                            workUnit={preview.splitSecondaryUnit}
                            variant="suggested"
                            previewLabel="Suggested 2/2 — overflow split"
                          />
                        </div>
                      ) : null}
                    </PlanningSuggestionShell>
                  </AnimatedBoardItem>
                );
              })
            )}
          </AnimatedBoardList>
        </QueueSubzone>

        <QueueSubzone title="Attach" count={board.queue.attach.length}>
          <AnimatedBoardList className="space-y-2">
            {board.queue.attach.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No ready tasks matching draft units.
              </p>
            ) : (
              board.queue.attach.map(({ task, candidateUnits }) => (
                <AnimatedBoardItem key={task.id} id={task.id} layoutId={`task-${task.id}`}>
                  <PlanningSuggestionShell
                    label="Attach to unit"
                    action={
                      candidateUnits.length === 1 ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => addTaskToWorkUnit(task.id, candidateUnits[0]!.id)}
                        >
                          Add to unit
                        </Button>
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={<Button type="button" size="sm" variant="outline" />}
                          >
                            Add to unit
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {candidateUnits.map((unit) => (
                              <DropdownMenuItem
                                key={unit.id}
                                onClick={() => addTaskToWorkUnit(task.id, unit.id)}
                              >
                                {unit.id} ({unit.taskIds.length} tasks)
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )
                    }
                  >
                    <TaskCard task={task} variant="compact" />
                  </PlanningSuggestionShell>
                </AnimatedBoardItem>
              ))
            )}
          </AnimatedBoardList>
        </QueueSubzone>

        <QueueSubzone title="Alone" count={board.queue.alone.length}>
          <AnimatedBoardList className="space-y-2">
            {board.queue.alone.length === 0 ? (
              <p className="text-xs text-muted-foreground">No solo ready tasks.</p>
            ) : (
              board.queue.alone.map((task) => (
                <AnimatedBoardItem key={task.id} id={task.id} layoutId={`solo-${task.id}`}>
                  <PlanningSuggestionShell
                    label="Solo unit"
                    action={
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => createWorkUnitFromReadyTasks([task.id])}
                      >
                        Create solo unit
                      </Button>
                    }
                  >
                    <WorkUnitCard
                      workUnit={previewSoloUnit(task)}
                      variant="suggested"
                      showEyebrow={false}
                    />
                  </PlanningSuggestionShell>
                </AnimatedBoardItem>
              ))
            )}
          </AnimatedBoardList>
        </QueueSubzone>
      </div>
      </ZoneDropTarget>
    </ZoneShell>
  );
}
