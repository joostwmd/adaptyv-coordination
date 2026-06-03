import { Card, CardContent } from "@adaptyv-coordination/ui/components/card";
import { cn } from "@adaptyv-coordination/ui/lib/utils";
import type { ReactNode } from "react";

import type { ExperimentRunSummary, ExperimentSummary, Task } from "@/types";

import { ExperimentRunContent } from "./experiment-run-content";

type ExperimentRunCardProps = {
  run: ExperimentRunSummary;
  experiment: ExperimentSummary;
  defaultExpanded?: boolean;
  className?: string;
  onTaskOpen?: (task: Task) => void;
  renderTask?: (task: Task) => ReactNode;
};

export function ExperimentRunCard({
  run,
  experiment,
  defaultExpanded = false,
  className,
  onTaskOpen,
  renderTask,
}: ExperimentRunCardProps) {
  return (
    <Card className={cn(className)}>
      <CardContent className="pt-6 pb-3">
        <ExperimentRunContent
          run={run}
          experiment={experiment}
          showTasks
          defaultTasksOpen={defaultExpanded}
          onTaskOpen={onTaskOpen}
          renderTask={renderTask}
        />
      </CardContent>
    </Card>
  );
}
