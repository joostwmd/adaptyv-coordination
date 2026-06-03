import type { Task } from "@/domain/task/types";

export type TicketExecutionStatus =
  | "not_started"
  | "started"
  | "done"
  | "failed";

/** Derive lab execution state from all tasks in the ticket's work unit. */
export function deriveTicketExecutionStatus(tasks: Task[]): TicketExecutionStatus {
  if (tasks.length === 0) return "not_started";

  if (tasks.every((task) => task.status === "failed")) {
    return "failed";
  }

  if (tasks.every((task) => task.status === "completed")) {
    return "done";
  }

  if (
    tasks.some(
      (task) => task.readiness === "in_labos" || task.status === "in_progress",
    )
  ) {
    return "started";
  }

  return "not_started";
}
