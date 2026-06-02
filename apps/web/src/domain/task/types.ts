import type { BlockedReason } from "@/domain/blocked-reason";

export type TaskOrigin = "template" | "standalone" | "rerun";

export type TaskReadiness =
  | "blocked"
  | "waiting_upstream"
  | "ready"
  | "batched"
  | "in_labos";

export type Task = {
  id: string;
  taskTemplateId: string;
  name?: string;
  origin: TaskOrigin;
  parentTaskId?: string;
  experimentIds: string[];
  params: Record<string, unknown>;
  dependsOn: string[];
  readiness: TaskReadiness;
  blockedReason?: BlockedReason;
  workUnitId?: string;
  createdAt: string;
};
