import type { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardHeader,
} from "@adaptyv-coordination/ui/components/card";
import { cn } from "@adaptyv-coordination/ui/lib/utils";
import { motion } from "motion/react";

import type { Task } from "@/domain/task/types";
import type { WorkUnit } from "@/domain/work-unit/types";
import { useWorkUnitView } from "@/hooks/useWorkUnit";
import { TaskCard } from "@/components/task/task-card";
import { WorkUnitContent } from "@/components/work-unit/work-unit-content";
import { WorkUnitContentHeader } from "@/components/work-unit/work-unit-content-header";

import { PriorityIndicator } from "./priority-indicator";

type WorkUnitCardProps = {
  workUnit: WorkUnit;
  variant?: "default" | "suggested";
  defaultExpanded?: boolean;
  layoutId?: string;
  previewLabel?: string;
  showEyebrow?: boolean;
  renderTask?: (task: Task) => ReactNode;
};

export function WorkUnitCard({
  workUnit,
  variant = "default",
  defaultExpanded = false,
  layoutId,
  previewLabel,
  showEyebrow = true,
  renderTask,
}: WorkUnitCardProps) {
  const view = useWorkUnitView(workUnit);

  if (!view) return null;

  const isSuggested = variant === "suggested";
  const isSingleTaskSuggested = isSuggested && view.tasks.length === 1;

  const headerEnd = view.priority ? (
    <PriorityIndicator priority={view.priority} context="workUnit" />
  ) : null;

  const card = (
    <Card
      className={cn(
        "overflow-hidden",
        isSuggested && "border-border/60 bg-background/50 shadow-none",
        isSuggested && previewLabel && "border-dashed border-muted-foreground/30",
      )}
    >
      {isSuggested && showEyebrow ? (
        <p className="border-b border-border/50 bg-muted/20 px-4 py-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {previewLabel ?? "Suggested unit"}
        </p>
      ) : null}

      <CardHeader
        className={cn(
          "space-y-0 pb-3",
          isSuggested && showEyebrow ? "pt-4" : "pt-6",
          "px-4",
        )}
      >
        <WorkUnitContentHeader
          workUnit={workUnit}
          view={view}
          headerEnd={headerEnd}
        />
      </CardHeader>

      <CardContent className="border-t border-border/50 px-4 pb-4 pt-0">
        <WorkUnitContent
          workUnit={workUnit}
          showHeader={false}
          showTasks={!isSingleTaskSuggested}
          defaultTasksOpen={defaultExpanded}
          renderTask={renderTask}
        />
        {isSingleTaskSuggested ? (
          <div className="mt-4 flex flex-col gap-2 border-t border-border/50 pt-4">
            {view.tasks.map((task) =>
              renderTask ? (
                <div key={task.id}>{renderTask(task)}</div>
              ) : (
                <TaskCard
                  key={task.id}
                  task={task}
                  variant="compact"
                  hide={["workUnit"]}
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
