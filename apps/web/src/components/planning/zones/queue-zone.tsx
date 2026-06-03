import { useMemo } from "react";
import { Button } from "@adaptyv-coordination/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@adaptyv-coordination/ui/components/dropdown-menu";

import type { Task } from "@/domain/task/types";
import { createWorkUnitFromTasks, suggestSplit } from "@/domain/work-unit";
import { usePlanningBoard } from "@/hooks/usePlanningBoard";
import { usePlanningStore } from "@/stores/usePlanningStore";
import { usePrototypeStore } from "@/stores/usePrototypeStore";

import { PlanningSuggestionShell } from "../primitives/planning-suggestion-shell";
import { ZoneDropTarget } from "../dnd/zone-drop-target";
import { WorkUnitCard } from "../work-unit-card";
import { TaskCard } from "@/components/task/task-card";
import {
  AnimatedBoardItem,
  AnimatedBoardList,
} from "./animated-board-item";
import { QueueSubzone, ZoneShell } from "./zone-shell";

export function QueueZone() {
  const board = usePlanningBoard();
  const createWorkUnitFromReadyTasks = usePlanningStore(
    (state) => state.createWorkUnitFromReadyTasks,
  );
  const createSplitUnitsFromReadyTasks = usePlanningStore(
    (state) => state.createSplitUnitsFromReadyTasks,
  );
  const addTaskToWorkUnit = usePlanningStore((state) => state.addTaskToWorkUnit);
  const weights = usePlanningStore((state) => state.weights);
  const currentDay = usePlanningStore((state) => state.currentDay);
  const experiments = usePrototypeStore((state) => state.experiments);

  const experimentsById = useMemo(
    () =>
      Object.fromEntries(
        experiments.map((experiment) => {
          const { runs: _runs, ...summary } = experiment;
          return [experiment.id, summary];
        }),
      ),
    [experiments],
  );

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
                const suggested = createWorkUnitFromTasks(group.tasks);
                const split = suggestSplit(group.tasks, experimentsById, weights, currentDay);
                const showSplitPreview = split.secondary.length > 0;

                return (
                  <AnimatedBoardItem
                    key={group.workUnitKey}
                    id={`pool-${group.workUnitKey}`}
                    layoutId={`pool-${group.workUnitKey}`}
                  >
                    <PlanningSuggestionShell
                      label={showSplitPreview ? "Over capacity — split" : undefined}
                      action={
                        showSplitPreview ? (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              createSplitUnitsFromReadyTasks(
                                group.tasks.map((task) => task.id),
                              )
                            }
                          >
                            Split unit
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              createWorkUnitFromReadyTasks(
                                group.tasks.map((task) => task.id),
                              )
                            }
                          >
                            Create unit
                          </Button>
                        )
                      }
                    >
                      <WorkUnitCard
                        workUnit={suggested}
                        variant="suggested"
                        showEyebrow={false}
                        layoutId={`pool-preview-${group.workUnitKey}`}
                      />
                      {showSplitPreview ? (
                        <div className="grid gap-2">
                          <WorkUnitCard
                            workUnit={createWorkUnitFromTasks(split.primary)}
                            variant="suggested"
                            previewLabel="Suggested 1/2"
                          />
                          <WorkUnitCard
                            workUnit={createWorkUnitFromTasks(split.secondary)}
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
                      workUnit={createWorkUnitFromTasks([task])}
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
