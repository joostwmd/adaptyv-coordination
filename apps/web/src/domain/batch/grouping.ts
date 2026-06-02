import { pickBatchableParams } from "@/domain/task-template/param-schema";
import { getTaskTemplate } from "@/domain/task-template/catalog";
import type { Ticket } from "@/domain/ticket/types";
import type { Batch } from "./types";

let batchIdCounter = 0;

export function resetBatchIdCounter(seed = 0): void {
  batchIdCounter = seed;
}

export function nextBatchId(prefix = "batch"): string {
  batchIdCounter += 1;
  return `${prefix}-${batchIdCounter}`;
}

export function computeBatchKey(ticket: Ticket): string {
  const template = getTaskTemplate(ticket.taskTemplateId);
  const batchParams = template
    ? pickBatchableParams(ticket.params, template.batchKeyFields)
    : {};
  return JSON.stringify({
    taskTemplateId: ticket.taskTemplateId,
    plateTypeId: template?.plateTypeId ?? null,
    params: batchParams,
  });
}

export function groupTicketsByBatchKey(
  tickets: Ticket[],
): Map<string, Ticket[]> {
  const groups = new Map<string, Ticket[]>();
  for (const ticket of tickets) {
    if (ticket.readiness !== "ready") continue;
    const key = computeBatchKey(ticket);
    const list = groups.get(key) ?? [];
    list.push(ticket);
    groups.set(key, list);
  }
  return groups;
}

export function createBatchFromTickets(
  tickets: Ticket[],
  options: { id?: string; status?: Batch["status"] } = {},
): Batch {
  if (tickets.length === 0) {
    throw new Error("Cannot create batch from empty ticket list");
  }
  const key = computeBatchKey(tickets[0]!);
  return {
    id: options.id ?? nextBatchId(),
    taskTemplateId: tickets[0]!.taskTemplateId,
    batchKey: key,
    ticketIds: tickets.map((t) => t.id),
    assigneeIds: [],
    notes: [],
    status: options.status ?? "draft",
  };
}

export function groupIntoDraftBatches(tickets: Ticket[]): Batch[] {
  const groups = groupTicketsByBatchKey(tickets);
  return [...groups.values()].map((group) => createBatchFromTickets(group));
}
