import type { StaffMember } from "@/types";

export type BatchNote = {
  id: string;
  author: StaffMember;
  body: string;
  createdAt: string;
};

export type BatchStatus = "draft" | "ready" | "sent";

export type Batch = {
  id: string;
  taskTemplateId: string;
  batchKey: string;
  ticketIds: string[];
  assigneeIds: string[];
  scheduledDay?: string;
  notes: BatchNote[];
  status: BatchStatus;
};

export type AggregatedResources = Record<string, number>;

export type CapacityOverflow = {
  resourceType: string;
  used: number;
  limit: number;
};

export type CapacityStatus = {
  withinCapacity: boolean;
  overflows: CapacityOverflow[];
};

export type BatchPriority = {
  score: number;
  driverTicketId: string;
};
