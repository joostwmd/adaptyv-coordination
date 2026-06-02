import type { BlockedReason } from "@/domain/blocked-reason";

export type TicketOrigin = "template" | "standalone" | "rerun";

export type TicketReadiness =
  | "blocked"
  | "waiting_upstream"
  | "ready"
  | "batched"
  | "in_labos";

export type Ticket = {
  id: string;
  taskTemplateId: string;
  name?: string;
  origin: TicketOrigin;
  parentTicketId?: string;
  experimentIds: string[];
  params: Record<string, unknown>;
  dependsOn: string[];
  readiness: TicketReadiness;
  blockedReason?: BlockedReason;
  batchId?: string;
  createdAt: string;
};
