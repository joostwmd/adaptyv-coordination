import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@adaptyv-coordination/ui/components/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@adaptyv-coordination/ui/components/collapsible";
import { cn } from "@adaptyv-coordination/ui/lib/utils";
import { ChevronDownIcon } from "lucide-react";

import type { Task } from "@/domain/task/types";
import type { WorkUnit } from "@/domain/work-unit/types";
import { useWorkUnitView } from "@/hooks/useWorkUnit";
import { WORK_UNIT_STATUS_CONFIG } from "./constants";
import { PriorityIndicator } from "./priority-indicator";
import { AssigneesRow } from "./primitives/assignees-row";
import { ScheduledTime } from "./primitives/scheduled-time";
import { WorkUnitNotesPreview } from "./primitives/work-unit-notes-preview";
import { TaskCard } from "./task-card";

type WorkUnitCardProps = {
  workUnit: WorkUnit;
  defaultExpanded?: boolean;
  onTaskOpen: (task: Task) => void;
};

export function WorkUnitCard({
  workUnit,
  defaultExpanded = false,
  onTaskOpen,
}: WorkUnitCardProps) {
  const [open, setOpen] = useState(defaultExpanded);
  const view = useWorkUnitView(workUnit);

  if (!view) return null;

  const statusConfig = WORK_UNIT_STATUS_CONFIG[workUnit.status];

  return (
    <Card>
      <CardHeader className="gap-2 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1 space-y-2">
            <CardTitle className="text-base leading-snug">{view.templateLabel}</CardTitle>
            <p className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-muted-foreground">
              <span>{statusConfig.label}</span>
              <span aria-hidden>·</span>
              <span>
                {view.experimentCount} experiment{view.experimentCount === 1 ? "" : "s"}
              </span>
              <span aria-hidden>·</span>
              <span className="inline-flex items-center gap-1">
                <span>Scheduled</span>
                <ScheduledTime
                  scheduledDay={workUnit.scheduledDay}
                  className="h-auto p-0 text-xs font-normal text-muted-foreground"
                />
              </span>
            </p>
            <AssigneesRow assignees={view.assignees} />
          </div>
          {view.priority ? (
            <PriorityIndicator priority={view.priority} context="workUnit" />
          ) : null}
        </div>
      </CardHeader>

      <CardContent className="pt-0 pb-3">
        <Collapsible open={open} onOpenChange={setOpen}>
          <CollapsibleTrigger
            className={cn(
              "flex w-full items-center justify-between rounded-md border bg-muted/30 px-3 py-2.5 text-xs font-medium",
              "hover:bg-muted/50 transition-colors",
            )}
          >
            <span>
              {open ? "Hide" : "Show"} {view.tasks.length} task
              {view.tasks.length === 1 ? "" : "s"}
            </span>
            <ChevronDownIcon
              className={cn("size-4 shrink-0 transition-transform", open && "rotate-180")}
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 flex flex-col gap-2">
            {view.enrichedTasks.map(({ task }) => (
              <TaskCard
                key={task.id}
                task={task}
                onOpen={onTaskOpen}
                variant="compact"
              />
            ))}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>

      <CardFooter className="flex flex-col items-stretch gap-3 border-t border-border/50 pt-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-foreground">
          Notes
        </h3>
        <WorkUnitNotesPreview notes={workUnit.notes} />
      </CardFooter>
    </Card>
  );
}
