import { ParameterSummary } from "@/components/planning/parameter-summary";
import type { WorkUnit } from "@/domain/work-unit/types";
import type { Task } from "@/types";

export type WorkUnitParameterSummaryProps = {
  workUnit: WorkUnit;
  tasks: Task[];
  variant?: "card" | "flat";
  showHeading?: boolean;
};

export function WorkUnitParameterSummary({
  workUnit,
  tasks,
  variant = "card",
  showHeading = true,
}: WorkUnitParameterSummaryProps) {
  // Get representative task (first one with parameters that matches the work unit template)
  const representativeTask = tasks.find(
    (task) =>
      task.taskTemplateId === workUnit.taskTemplateId &&
      Object.keys(task.params).length > 0,
  ) || tasks[0];

  if (!representativeTask) {
    return null;
  }

  return (
    <ParameterSummary
      task={representativeTask}
      showHeading={showHeading}
      variant={variant}
    />
  );
}