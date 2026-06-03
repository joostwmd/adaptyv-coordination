import { useState, type ReactNode } from "react";
import { Card, CardContent, CardHeader } from "@adaptyv-coordination/ui/components/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@adaptyv-coordination/ui/components/collapsible";
import { cn } from "@adaptyv-coordination/ui/lib/utils";
import { ChevronDownIcon } from "lucide-react";
import { motion } from "motion/react";

import type { Task } from "@/domain/task/types";
import type { WorkUnit } from "@/domain/work-unit/types";
import { useWorkUnitView } from "@/hooks/useWorkUnit";
import { WorkUnitContent } from "@/components/work-unit/work-unit-content";
import { WorkUnitHoverCard } from "@/components/work-unit/work-unit-hover-card";

import { PriorityIndicator } from "./priority-indicator";
import { PlanningTaskCard } from "./planning-task-card";

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
  const [open, setOpen] = useState(defaultExpanded);
  const view = useWorkUnitView(workUnit);

  if (!view) return null;

  const isSuggested = variant === "suggested";
  const isSingleTaskSuggested = isSuggested && view.tasks.length === 1;

  const taskList = view.enrichedTasks.map(({ task }) =>
    renderTask ? (
      <div key={task.id}>{renderTask(task)}</div>
    ) : (
      <PlanningTaskCard
        key={task.id}
        task={task}
        onOpen={onTaskOpen}
        variant="compact"
        layoutId={isSingleTaskSuggested ? undefined : `task-${task.id}`}
      />
    ),
  );

  const card = (
    <Card
      className={cn(
        isSuggested && "border-border/60 bg-background/50 shadow-none",
        isSuggested && previewLabel && "border-dashed border-muted-foreground/30",
      )}
    >
      <CardHeader className="gap-2 pb-3">
        {isSuggested && showEyebrow ? (
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {previewLabel ?? "Suggested unit"}
          </p>
        ) : null}
        <div className="flex items-start gap-2">
          <WorkUnitHoverCard
            workUnit={workUnit}
            trigger={
              <button
                type="button"
                className={cn(
                  "min-w-0 flex-1 rounded-sm text-left outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isSuggested && "text-muted-foreground",
                )}
              >
                <WorkUnitContent workUnit={workUnit} variant="compact" />
              </button>
            }
          />
          {view.priority ? (
            <PriorityIndicator priority={view.priority} context="workUnit" />
          ) : null}
        </div>
      </CardHeader>

      <CardContent className="pt-0 pb-3">
        {isSingleTaskSuggested ? (
          <div className="flex flex-col gap-2">{taskList}</div>
        ) : (
          <motion.div layoutRoot>
            <Collapsible open={open} onOpenChange={setOpen}>
              <CollapsibleTrigger
                className={cn(
                  "flex w-full items-center justify-between rounded-md border px-3 py-2.5 text-xs font-medium transition-colors",
                  isSuggested
                    ? "border-dashed border-muted-foreground/30 bg-muted/20 hover:bg-muted/35"
                    : "bg-muted/30 hover:bg-muted/50",
                )}
              >
                <span>
                  {open ? "Hide" : "Show"} {view.tasks.length} task
                  {view.tasks.length === 1 ? "" : "s"}
                </span>
                <ChevronDownIcon
                  className={cn(
                    "size-4 shrink-0 transition-transform",
                    open && "rotate-180",
                  )}
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2 flex flex-col gap-2 overflow-hidden">
                {taskList}
              </CollapsibleContent>
            </Collapsible>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );

  if (!layoutId) return card;

  return (
    <motion.div layoutId={layoutId}>
      {card}
    </motion.div>
  );
}
