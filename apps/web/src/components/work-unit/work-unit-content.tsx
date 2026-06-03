import { cn } from "@adaptyv-coordination/ui/lib/utils";
import type { ReactNode } from "react";

import { CollapsibleTaskList } from "@/components/task/collapsible-task-list";
import type { TaskReferenceKey } from "@/components/task/task-references";
import type { WorkUnit } from "@/domain/work-unit/types";
import type { Task } from "@/types";
import { useWorkUnitView } from "@/hooks/useWorkUnit";

import { WorkUnitContentHeader } from "./work-unit-content-header";
import { WorkUnitMetadataRow } from "./work-unit-metadata-row";
import { WorkUnitParameterSummary } from "./work-unit-parameter-summary";
import { WorkUnitRequiredPlatesSummary } from "./work-unit-required-plates-summary";

export type WorkUnitContentProps = {
  workUnit: WorkUnit;
  variant?: "default" | "compact";
  showTasks?: boolean;
  defaultTasksOpen?: boolean;
  renderTask?: (task: Task) => ReactNode;
  taskListHide?: TaskReferenceKey[];
  onTaskOpen?: (task: Task) => void;
  headerEnd?: ReactNode;
  className?: string;
};

export function WorkUnitContent({
  workUnit,
  variant = "default",
  showTasks = false,
  defaultTasksOpen = false,
  renderTask,
  taskListHide = ["workUnit"],
  onTaskOpen,
  headerEnd,
  className,
}: WorkUnitContentProps) {
  const view = useWorkUnitView(workUnit);
  if (!view) return null;

  const isCompact = variant === "compact";

  return (
    <article
      className={cn("flex flex-col gap-3", className)}
      aria-label={`Work unit ${workUnit.id}`}
    >
      <WorkUnitContentHeader
        workUnit={workUnit}
        view={view}
        variant={variant}
        headerEnd={headerEnd}
      />

      <WorkUnitMetadataRow workUnit={workUnit} view={view} />

      {!isCompact ? (
        <div className="flex flex-col gap-3">
          <WorkUnitParameterSummary
            workUnit={workUnit}
            tasks={view.tasks}
            showHeading
          />
          <WorkUnitRequiredPlatesSummary tasks={view.tasks} />
        </div>
      ) : null}

      {showTasks ? (
        <CollapsibleTaskList
          tasks={view.tasks}
          renderTask={renderTask}
          hide={taskListHide}
          defaultOpen={defaultTasksOpen}
          onTaskOpen={onTaskOpen}
        />
      ) : null}
    </article>
  );
}
