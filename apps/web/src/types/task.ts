import type { BlockedReason } from "@/domain/blocked-reason";
import { getTaskTemplate } from "@/domain/task-template/catalog";

import type { StaffMember } from "./staff";

export type TaskStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "failed"
  | "blocked"
  | "cancelled";

export type TaskOrigin = "template" | "standalone" | "rerun";

export type TaskReadiness =
  | "blocked"
  | "waiting_upstream"
  | "ready"
  | "batched"
  | "in_labos";

export type TaskNote = {
  id: string;
  author: StaffMember;
  body: string;
  createdAt: string;
};

export type Task = {
  id: string;
  taskTemplateId: string;
  name?: string;
  origin: TaskOrigin;
  parentTaskId?: string;

  /** Lab OS experiment; omitted for global standalone tasks (e.g. buffer prep). */
  experimentId?: string;
  /** Experiment run revision; omitted when not tied to a run. */
  runId?: string;
  params: Record<string, unknown>;

  status: TaskStatus;
  readiness: TaskReadiness;
  blockedReason?: BlockedReason;
  workUnitId?: string;
  dependsOn: string[];

  assignee?: StaffMember;
  notes: TaskNote[];
  createdAt: string;
};

export type RunTaskStats = {
  taskCount: number;
  completedTaskCount: number;
  failedTaskCount: number;
};

/** Derive denormalized run counters from the task collection. */
export function deriveRunTaskStats(runId: string, tasks: Task[]): RunTaskStats {
  const runTasks = tasks.filter((t) => t.runId === runId);
  return {
    taskCount: runTasks.length,
    completedTaskCount: runTasks.filter((t) => t.status === "completed").length,
    failedTaskCount: runTasks.filter((t) => t.status === "failed").length,
  };
}

export function getTaskDisplayName(task: Task): string {
  if (task.name) return task.name;
  return getTaskTemplate(task.taskTemplateId)?.name ?? "Task";
}
