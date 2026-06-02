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

import { SuggestedUnitShell } from "../primitives/suggested-unit-shell";
import { WorkUnitCard } from "../work-unit-card";
import { TaskCard } from "../task-card";
import {
  AnimatedBoardItem,
  AnimatedBoardList,
} from "./animated-board-item";
import { QueueSubzone, ZoneShell } from "./zone-shell";

type QueueZoneProps = {
  onTaskOpen: (task: Task) => void;
};

export function QueueZone({ onTaskOpen }: QueueZoneProps) {
  const board = usePlanningBoard();
  const createWorkUnitFromReadyTasks = usePlanningStore(
    (state) => state.createWorkUnitFromReadyTasks,
  );
  const addTaskToWorkUnit = usePlanningStore((state) => state.addTaskToWorkUnit);
  const weights = usePlanningStore((state) => state.weights);
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
      <div className="space-y-3">
        <QueueSubzone title="Pool" count={board.queue.pool.length}>
          <AnimatedBoardList className="space-y-3">
            {board.queue.pool.length === 0 ? (
              <p className="text-xs text-muted-foreground">No batchable groups.</p>
            ) : (
              board.queue.pool.map((group) => {
                const suggested = createWorkUnitFromTasks(group.tasks);
                const split = suggestSplit(group.tasks, experimentsById, weights);
                const showSplitPreview = split.secondary.length > 0;

                return (
                  <AnimatedBoardItem
                    key={group.workUnitKey}
                    id={`pool-${group.workUnitKey}`}
                    layoutId={`pool-${group.workUnitKey}`}
                  >
                    <SuggestedUnitShell
                      createPoolAction={
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
                      }
                    >
                      <WorkUnitCard
                        workUnit={suggested}
                        variant="suggested"
                        showEyebrow={false}
                        onTaskOpen={onTaskOpen}
                        layoutId={`pool-preview-${group.workUnitKey}`}
                      />
                      {showSplitPreview ? (
                        <div className="grid gap-2">
                          <WorkUnitCard
                            workUnit={createWorkUnitFromTasks(split.primary)}
                            variant="suggested"
                            previewLabel="Suggested 1/2"
                            onTaskOpen={onTaskOpen}
                          />
                          <WorkUnitCard
                            workUnit={createWorkUnitFromTasks(split.secondary)}
                            variant="suggested"
                            previewLabel="Suggested 2/2 — overflow split"
                            onTaskOpen={onTaskOpen}
                          />
                        </div>
                      ) : null}
                    </SuggestedUnitShell>
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
                  <SuggestedUnitShell
                    label="Attach to unit"
                    attachAction={
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
                    <TaskCard task={task} onOpen={onTaskOpen} variant="compact" />
                  </SuggestedUnitShell>
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
                <AnimatedBoardItem key={task.id} id={task.id} layoutId={`task-${task.id}`}>
                  <SuggestedUnitShell
                    label="Solo unit"
                    createAloneAction={
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
                      defaultExpanded
                      onTaskOpen={onTaskOpen}
                    />
                  </SuggestedUnitShell>
                </AnimatedBoardItem>
              ))
            )}
          </AnimatedBoardList>
        </QueueSubzone>
      </div>
    </ZoneShell>
  );
}
