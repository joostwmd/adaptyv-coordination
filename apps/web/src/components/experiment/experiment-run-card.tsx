import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader } from "@adaptyv-coordination/ui/components/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@adaptyv-coordination/ui/components/collapsible";
import { cn } from "@adaptyv-coordination/ui/lib/utils";
import { ChevronDownIcon } from "lucide-react";

import { TaskCard } from "@/components/task/task-card";
import { useTasksByRun } from "@/hooks/useTasks";
import type { ExperimentRunSummary, ExperimentSummary, Task } from "@/types";
import { getTaskDisplayName } from "@/types/task";

import { ExperimentRunContent } from "./experiment-run-content";
import { ExperimentRunHoverCard } from "./experiment-run-hover-card";

type ExperimentRunCardProps = {
  run: ExperimentRunSummary;
  experiment: ExperimentSummary;
  defaultExpanded?: boolean;
  className?: string;
  onTaskView?: (task: Task) => void;
};

export function ExperimentRunCard({
  run,
  experiment,
  defaultExpanded = false,
  className,
  onTaskView,
}: ExperimentRunCardProps) {
  const [open, setOpen] = useState(defaultExpanded);
  const runTasks = useTasksByRun(run.id);

  const tasks = useMemo(
    () =>
      [...runTasks].sort((a, b) =>
        getTaskDisplayName(a).localeCompare(getTaskDisplayName(b)),
      ),
    [runTasks],
  );

  const taskCount = tasks.length;

  return (
    <Card className={cn(className)}>
      <CardHeader className="gap-2 pb-3">
        <ExperimentRunHoverCard
          run={run}
          experiment={experiment}
          trigger={
            <button
              type="button"
              className="w-full rounded-sm text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ExperimentRunContent run={run} experiment={experiment} variant="compact" />
            </button>
          }
        />
      </CardHeader>

      <CardContent className="pt-0 pb-3">
        {taskCount === 0 ? (
          <p className="rounded-md border border-dashed px-3 py-4 text-center text-xs text-muted-foreground">
            No tasks in this run yet
          </p>
        ) : (
          <Collapsible open={open} onOpenChange={setOpen}>
            <CollapsibleTrigger
              className="flex w-full items-center justify-between rounded-md border bg-muted/30 px-3 py-2.5 text-xs font-medium transition-colors hover:bg-muted/50"
            >
              <span>
                {open ? "Hide" : "Show"} {taskCount} task
                {taskCount === 1 ? "" : "s"}
              </span>
              <ChevronDownIcon
                className={cn(
                  "size-4 shrink-0 transition-transform",
                  open && "rotate-180",
                )}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 flex flex-col gap-2 overflow-hidden">
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  run={run}
                  experiment={experiment}
                  variant="embedded"
                  onView={onTaskView}
                  showPlanningLinks
                />
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );
}
