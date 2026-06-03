import { cn } from "@adaptyv-coordination/ui/lib/utils";
import type { ReactNode } from "react";

import { ContentSection } from "@/shared/layout/content-section";
import { CollapsibleTaskList } from "@/entities/task/collapsible-task-list";
import type { TaskReferenceKey } from "@/entities/task/task-references";
import { aggregateRequiredPlatesForTasks } from "@/domain/plate/requirements";
import { getTaskTemplate } from "@/domain/task-template/catalog";
import {
  getPlanningParamFieldsForDisplay,
  paramFieldHasValue,
} from "@/domain/task-template/param-schema";
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
  showHeader?: boolean;
  showTasks?: boolean;
  defaultTasksOpen?: boolean;
  renderTask?: (task: Task) => ReactNode;
  taskListHide?: TaskReferenceKey[];
  headerEnd?: ReactNode;
  className?: string;
};

function workUnitHasDisplayableDetails(workUnit: WorkUnit, tasks: Task[]): boolean {
  const hasPlates = aggregateRequiredPlatesForTasks(tasks).length > 0;
  const representative =
    tasks.find(
      (task) =>
        task.taskTemplateId === workUnit.taskTemplateId &&
        Object.keys(task.params ?? {}).length > 0,
    ) ??
    tasks.find((task) => Object.keys(task.params ?? {}).length > 0) ??
    tasks[0];

  if (!representative) return hasPlates;

  const template = getTaskTemplate(representative.taskTemplateId);
  if (!template) return hasPlates;

  const fields = getPlanningParamFieldsForDisplay(
    template.paramSchema,
    representative.params,
  );
  const hasParams = fields.some((field) =>
    paramFieldHasValue(representative.params[field.name]),
  );

  return hasPlates || hasParams;
}

export function WorkUnitContent({
  workUnit,
  variant = "default",
  showHeader = true,
  showTasks = false,
  defaultTasksOpen = false,
  renderTask,
  taskListHide = ["workUnit"],
  headerEnd,
  className,
}: WorkUnitContentProps) {
  const view = useWorkUnitView(workUnit);
  if (!view) return null;

  const isCompact = variant === "compact";
  const showDetails = !isCompact && workUnitHasDisplayableDetails(workUnit, view.tasks);

  return (
    <article
      className={cn("flex flex-col", className)}
      aria-label={`Work unit ${workUnit.id}`}
    >
      {showHeader ? (
        <WorkUnitContentHeader
          workUnit={workUnit}
          view={view}
          variant={variant}
          headerEnd={headerEnd}
        />
      ) : null}

      <div
        className={cn(
          "flex flex-col gap-4",
          showHeader && "border-t border-border/50 pt-4",
          !showHeader && "pt-4",
        )}
      >
        <WorkUnitMetadataRow workUnit={workUnit} view={view} />

        {showDetails ? (
          <ContentSection title="Unit details" divided={false}>
            <div className="flex flex-col gap-3">
              <WorkUnitParameterSummary
                workUnit={workUnit}
                tasks={view.tasks}
                showHeading={false}
              />
              <WorkUnitRequiredPlatesSummary tasks={view.tasks} />
            </div>
          </ContentSection>
        ) : null}

        {showTasks ? (
          <ContentSection divided={false}>
            <CollapsibleTaskList
              tasks={view.tasks}
              renderTask={renderTask}
              hide={taskListHide}
              defaultOpen={defaultTasksOpen}
            />
          </ContentSection>
        ) : null}
      </div>
    </article>
  );
}
