import { useState, type ReactNode } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@adaptyv-coordination/ui/components/collapsible";
import { cn } from "@adaptyv-coordination/ui/lib/utils";
import { ChevronDownIcon } from "lucide-react";

import type { Task } from "@/types";

import { TaskCard } from "./task-card";
import type { TaskReferenceKey } from "./task-references";

export type CollapsibleTaskListProps = {
  tasks: Task[];
  /** Custom row renderer (e.g. draggable planning row). Defaults to compact TaskCard. */
  renderTask?: (task: Task) => ReactNode;
  hide?: TaskReferenceKey[];
  defaultOpen?: boolean;
  onTaskOpen?: (task: Task) => void;
  className?: string;
  triggerClassName?: string;
};

export function CollapsibleTaskList({
  tasks,
  renderTask,
  hide,
  defaultOpen = false,
  onTaskOpen,
  className,
  triggerClassName,
}: CollapsibleTaskListProps) {
  const [open, setOpen] = useState(defaultOpen);
  const count = tasks.length;

  if (count === 0) {
    return (
      <p className="rounded-md border border-dashed px-3 py-4 text-center text-xs text-muted-foreground">
        No tasks yet
      </p>
    );
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen} className={className}>
      <CollapsibleTrigger
        className={cn(
          "flex w-full items-center justify-between rounded-md border bg-muted/30 px-3 py-2.5 text-xs font-medium transition-colors hover:bg-muted/50",
          triggerClassName,
        )}
      >
        <span>
          {open ? "Hide" : "Show"} {count} task{count === 1 ? "" : "s"}
        </span>
        <ChevronDownIcon
          className={cn("size-4 shrink-0 transition-transform", open && "rotate-180")}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2 flex flex-col gap-2 overflow-hidden">
        {tasks.map((task) =>
          renderTask ? (
            <div key={task.id}>{renderTask(task)}</div>
          ) : (
            <TaskCard
              key={task.id}
              task={task}
              variant="compact"
              hide={hide}
              onOpen={onTaskOpen}
            />
          ),
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
