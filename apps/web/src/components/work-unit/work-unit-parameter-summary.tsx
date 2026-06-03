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
  if (tasks.length === 0) {
    return null;
  }

  // Try to find the best representative task
  let representativeTask = 
    // First priority: task with matching template AND parameters
    tasks.find(
      (task) =>
        task.taskTemplateId === workUnit.taskTemplateId &&
        Object.keys(task.params || {}).length > 0,
    ) ||
    // Second priority: any task with parameters
    tasks.find((task) => Object.keys(task.params || {}).length > 0) ||
    // Fallback: first task
    tasks[0];

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