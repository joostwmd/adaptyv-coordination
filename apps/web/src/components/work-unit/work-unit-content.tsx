import { cn } from "@adaptyv-coordination/ui/lib/utils";
import type { ReactNode } from "react";

import { getWorkUnitTemplateLabel } from "@/components/planning/utils";
import { CollapsibleTaskList } from "@/components/task/collapsible-task-list";
import type { TaskReferenceKey } from "@/components/task/task-references";
import type { WorkUnit } from "@/domain/work-unit/types";
import type { Task } from "@/types";
import { useWorkUnitView } from "@/hooks/useWorkUnit";

import { WorkUnitContentHeader } from "./work-unit-content-header";
import { WorkUnitParameterSummary } from "./work-unit-parameter-summary";

type PreviewFieldProps = {
  label: string;
  value: ReactNode;
  className?: string;
};

function PreviewField({ label, value, className }: PreviewFieldProps) {
  return (
    <div className={cn("min-w-0", className)}>
      <dt className="text-[11px] leading-none text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-xs font-medium leading-snug text-foreground">{value}</dd>
    </div>
  );
}

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

      {!isCompact && !showTasks ? (
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-border/50 pt-3">
          <PreviewField
            label="Template"
            value={getWorkUnitTemplateLabel(workUnit)}
            className="col-span-2"
          />
          {view.driverTaskTitle ? (
            <PreviewField
              label="Driver task"
              value={view.driverTaskTitle}
              className="col-span-2"
            />
          ) : null}
          <PreviewField label="Batch key" value={workUnit.workUnitKey} className="col-span-2" />
        </dl>
      ) : null}

      {!isCompact ? (
        <WorkUnitParameterSummary
          workUnit={workUnit}
          tasks={view.tasks}
          variant="flat"
          showHeading={true}
        />
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
