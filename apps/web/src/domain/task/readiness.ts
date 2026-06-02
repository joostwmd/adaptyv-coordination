import { getMissingRequiredParams } from "@/domain/task-template/param-schema";
import { getTaskTemplate } from "@/domain/task-template/catalog";
import type { Task, TaskReadiness } from "./types";

export function computeReadiness(task: Task, allTasks: Task[]): TaskReadiness {
  if (task.readiness === "in_labos") {
    return "in_labos";
  }
  if (task.workUnitId) {
    return "batched";
  }
  if (task.blockedReason) {
    return "blocked";
  }

  const template = getTaskTemplate(task.taskTemplateId);
  if (template) {
    const missing = getMissingRequiredParams(template.paramSchema, task.params);
    if (missing.length > 0) {
      return "blocked";
    }
  }

  if (task.dependsOn.length > 0) {
    const byId = new Map(allTasks.map((t) => [t.id, t]));
    const upstreamReady = task.dependsOn.every((depId) => {
      const dep = byId.get(depId);
      return dep?.readiness === "in_labos";
    });
    if (!upstreamReady) {
      return "waiting_upstream";
    }
  }

  return "ready";
}

export function refreshTaskReadiness(task: Task, allTasks: Task[]): Task {
  return { ...task, readiness: computeReadiness(task, allTasks) };
}

export function refreshAllTaskReadiness(tasks: Task[]): Task[] {
  return tasks.map((t) => refreshTaskReadiness(t, tasks));
}
