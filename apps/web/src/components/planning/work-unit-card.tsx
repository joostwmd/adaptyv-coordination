import type { ReactNode } from "react";
import { Card, CardContent } from "@adaptyv-coordination/ui/components/card";
import { cn } from "@adaptyv-coordination/ui/lib/utils";
import { motion } from "motion/react";

import type { Task } from "@/domain/task/types";
import type { WorkUnit } from "@/domain/work-unit/types";
import { useWorkUnitView } from "@/hooks/useWorkUnit";
import { TaskCard } from "@/components/task/task-card";
import { WorkUnitContent } from "@/components/work-unit/work-unit-content";

import { PriorityIndicator } from "./priority-indicator";

type WorkUnitCardProps = {
  workUnit: WorkUnit;
  variant?: "default" | "suggested";
  defaultExpanded?: boolean;
  onTaskOpen: (task: Task) => void;
  layoutId?: string;
  previewLabel?: string;
  showEyebrow?: boolean;
  renderTask?: (task: Task) => ReactNode;
};

export function WorkUnitCard({
  workUnit,
  variant = "default",
  defaultExpanded = false,
  onTaskOpen,
  layoutId,
  previewLabel,
  showEyebrow = true,
  renderTask,
}: WorkUnitCardProps) {
  const view = useWorkUnitView(workUnit);

  if (!view) return null;

  const isSuggested = variant === "suggested";
  const isSingleTaskSuggested = isSuggested && view.tasks.length === 1;

  const card = (
    <Card
      className={cn(
        isSuggested && "border-border/60 bg-background/50 shadow-none",
        isSuggested && previewLabel && "border-dashed border-muted-foreground/30",
      )}
    >
      <CardContent className="pt-6 pb-3">
        {isSuggested && showEyebrow ? (
          <p className="mb-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {previewLabel ?? "Suggested unit"}
          </p>
        ) : null}
        <WorkUnitContent
          workUnit={workUnit}
          showTasks={!isSingleTaskSuggested}
          defaultTasksOpen={defaultExpanded}
          onTaskOpen={onTaskOpen}
          renderTask={renderTask}
          headerEnd={
            view.priority ? (
              <PriorityIndicator priority={view.priority} context="workUnit" />
            ) : null
          }
        />
        {isSingleTaskSuggested ? (
          <div className="mt-2 flex flex-col gap-2">
            {view.tasks.map((task) =>
              renderTask ? (
                <div key={task.id}>{renderTask(task)}</div>
              ) : (
                <TaskCard
                  key={task.id}
                  task={task}
                  variant="compact"
                  hide={["workUnit"]}
                  onOpen={onTaskOpen}
                />
              ),
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );

  if (!layoutId) return card;

  return <motion.div layoutId={layoutId}>{card}</motion.div>;
}
