import { Button } from "@adaptyv-coordination/ui/components/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@adaptyv-coordination/ui/components/drawer";
import { Badge } from "@adaptyv-coordination/ui/components/badge";

import type { Task } from "@/domain/task/types";
import { usePlanningBoard } from "@/hooks/usePlanningBoard";

import { PlanningTaskCard } from "../planning-task-card";

type NeedsAttentionDrawerProps = {
  onTaskOpen: (task: Task) => void;
};

function TaskSection({
  title,
  tasks,
  onTaskOpen,
}: {
  title: string;
  tasks: Task[];
  onTaskOpen: (task: Task) => void;
}) {
  return (
    <section className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
        <span className="ml-1.5 font-normal normal-case">({tasks.length})</span>
      </h3>
      {tasks.length === 0 ? (
        <p className="text-xs text-muted-foreground">None</p>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <PlanningTaskCard key={task.id} task={task} onOpen={onTaskOpen} variant="compact" />
          ))}
        </div>
      )}
    </section>
  );
}

export function NeedsAttentionDrawer({ onTaskOpen }: NeedsAttentionDrawerProps) {
  const board = usePlanningBoard();
  const totalCount =
    board.blockedTasks.length +
    board.waitingTasks.length +
    board.failedTasks.length;

  return (
    <Drawer direction="right">
      <DrawerTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="shrink-0">
          Needs attention
          {totalCount > 0 ? (
            <Badge variant="secondary" className="ml-1.5 px-1.5 py-0 text-[10px]">
              {totalCount}
            </Badge>
          ) : null}
        </Button>
      </DrawerTrigger>
      <DrawerContent className="flex h-full max-h-none flex-col data-[vaul-drawer-direction=right]:w-full data-[vaul-drawer-direction=right]:sm:max-w-md">
        <DrawerHeader className="shrink-0 border-b pb-3">
          <DrawerTitle>Tasks needing attention</DrawerTitle>
          <DrawerDescription>
            Tasks out of the forward planning path — blocked, waiting, or reruns
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-6 pt-4">
          <div className="space-y-6">
            <TaskSection
              title="Blocked"
              tasks={board.blockedTasks}
              onTaskOpen={onTaskOpen}
            />
            <TaskSection
              title="Waiting on dependencies"
              tasks={board.waitingTasks}
              onTaskOpen={onTaskOpen}
            />
            <TaskSection
              title="Reruns"
              tasks={board.failedTasks}
              onTaskOpen={onTaskOpen}
            />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
