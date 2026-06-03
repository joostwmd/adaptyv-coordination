import { Card, CardContent } from "@adaptyv-coordination/ui/components/card";
import { cn } from "@adaptyv-coordination/ui/lib/utils";

import type { ExperimentRunSummary, ExperimentSummary, Task } from "@/types";

import { TaskContent } from "./task-content";

type TaskCardProps = {
  task: Task;
  onView?: (task: Task) => void;
  variant?: "default" | "embedded";
  run?: ExperimentRunSummary;
  experiment?: ExperimentSummary;
  showPlanningLinks?: boolean;
};

export function TaskCard({
  task,
  onView,
  variant = "default",
  run,
  experiment,
  showPlanningLinks = true,
}: TaskCardProps) {
  const isEmbedded = variant === "embedded";

  return (
    <Card
      className={cn(
        isEmbedded && "shadow-none",
        onView && "cursor-pointer transition-colors hover:bg-muted/30",
      )}
      onClick={onView ? () => onView(task) : undefined}
      onKeyDown={
        onView
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onView(task);
              }
            }
          : undefined
      }
      role={onView ? "button" : undefined}
      tabIndex={onView ? 0 : undefined}
    >
      <CardContent className={cn(isEmbedded ? "px-4 py-3" : "pt-6")}>
        <TaskContent
          task={task}
          variant={variant}
          run={run}
          experiment={experiment}
          showPlanningLinks={showPlanningLinks}
        />
      </CardContent>
    </Card>
  );
}
