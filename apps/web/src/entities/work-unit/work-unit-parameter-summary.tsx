import { getTaskTemplate } from "@/domain/task-template/catalog";
import {
  getPlanningParamFieldsForDisplay,
  paramFieldHasValue,
} from "@/domain/task-template/param-schema";
import type { WorkUnit } from "@/domain/work-unit/types";
import type { Task } from "@/types";

import { ParameterSummary } from "@/components/planning/parameter-summary";

export type WorkUnitParameterSummaryProps = {
  workUnit: WorkUnit;
  tasks: Task[];
  showHeading?: boolean;
};

function pickRepresentativeTask(workUnit: WorkUnit, tasks: Task[]): Task | undefined {
  if (tasks.length === 0) return undefined;

  return (
    tasks.find(
      (task) =>
        task.taskTemplateId === workUnit.taskTemplateId &&
        Object.keys(task.params ?? {}).length > 0,
    ) ??
    tasks.find((task) => Object.keys(task.params ?? {}).length > 0) ??
    tasks[0]
  );
}

function hasDisplayableRunSettings(task: Task): boolean {
  const template = getTaskTemplate(task.taskTemplateId);
  if (!template) return false;
  const fields = getPlanningParamFieldsForDisplay(template.paramSchema, task.params);
  return fields.some((field) => paramFieldHasValue(task.params[field.name]));
}

export function WorkUnitParameterSummary({
  workUnit,
  tasks,
  showHeading = true,
}: WorkUnitParameterSummaryProps) {
  const representativeTask = pickRepresentativeTask(workUnit, tasks);
  if (!representativeTask || !hasDisplayableRunSettings(representativeTask)) {
    return null;
  }

  return (
    <ParameterSummary
      task={representativeTask}
      showHeading={showHeading}
      variant="card"
    />
  );
}
