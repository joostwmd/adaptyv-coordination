import { getTaskTemplate } from "@/domain/task-template/catalog";
import { getResourceDefinition } from "@/domain/resource/resources";
import type { Ticket } from "@/domain/ticket/types";
import type {
  AggregatedResources,
  Batch,
  CapacityStatus,
} from "./types";
import {
  buildTicketPriorityContext,
  scoreTicket,
  type PriorityWeights,
} from "@/domain/priority";
import type { ExperimentSummary } from "@/types";
import { DEFAULT_PRIORITY_WEIGHTS } from "@/domain/priority/weights";

export function aggregateResources(
  tickets: Ticket[],
): AggregatedResources {
  const totals: AggregatedResources = {};

  for (const ticket of tickets) {
    const template = getTaskTemplate(ticket.taskTemplateId);
    if (!template) continue;

    for (const req of template.resourceProfile) {
      const current = totals[req.resourceType] ?? 0;
      switch (req.scaling) {
        case "PER_TASK":
          totals[req.resourceType] = current + req.amount;
          break;
        case "PER_WORK_PACKAGE":
          totals[req.resourceType] = Math.max(current, req.amount);
          break;
        case "STEPPED": {
          const step = req.stepSize ?? 1;
          const units = Math.ceil(req.amount / step);
          totals[req.resourceType] = current + units;
          break;
        }
      }
    }
  }

  return totals;
}

export function getCapacityStatus(
  batch: Batch,
  tickets: Ticket[],
): CapacityStatus {
  const aggregated = aggregateResources(tickets);
  const overflows: CapacityStatus["overflows"] = [];

  for (const [resourceType, used] of Object.entries(aggregated)) {
    const def = getResourceDefinition(resourceType);
    if (!def) continue;
    if (used > def.capacity) {
      overflows.push({ resourceType, used, limit: def.capacity });
    }
  }

  return {
    withinCapacity: overflows.length === 0,
    overflows,
  };
}

export function computeFillRatio(batch: Batch, tickets: Ticket[]): number {
  const status = getCapacityStatus(batch, tickets);
  if (status.overflows.length > 0) return 1;
  const aggregated = aggregateResources(tickets);
  const ratios: number[] = [];
  for (const [resourceType, used] of Object.entries(aggregated)) {
    const def = getResourceDefinition(resourceType);
    if (def && def.capacity > 0) {
      ratios.push(used / def.capacity);
    }
  }
  return ratios.length ? Math.max(...ratios) : 0;
}

export type SplitSuggestion = {
  primary: Ticket[];
  secondary: Ticket[];
  overflows: CapacityStatus["overflows"];
};

export function suggestSplit(
  tickets: Ticket[],
  experimentsById: Record<string, ExperimentSummary>,
  weights: PriorityWeights = DEFAULT_PRIORITY_WEIGHTS,
): SplitSuggestion {
  const status = getCapacityStatus(
    { id: "", taskTemplateId: tickets[0]?.taskTemplateId ?? "", batchKey: "", ticketIds: [], assigneeIds: [], notes: [], status: "draft" },
    tickets,
  );

  const scored = tickets.map((ticket) => {
    const exp = experimentsById[ticket.experimentIds[0] ?? ""];
    const ctx = buildTicketPriorityContext(
      exp?.priority ?? 0,
      exp?.category ?? "rd",
      { customerTier: exp?.category === "production" ? 4 : 2, createdAt: ticket.createdAt },
    );
    return { ticket, score: scoreTicket(ticket, ctx, weights).total };
  });

  scored.sort((a, b) => b.score - a.score);

  const primary: Ticket[] = [];
  const secondary: Ticket[] = [];

  for (const { ticket } of scored) {
    const candidate = [...primary, ticket];
    const candidateStatus = getCapacityStatus(
      { id: "", taskTemplateId: ticket.taskTemplateId, batchKey: "", ticketIds: [], assigneeIds: [], notes: [], status: "draft" },
      candidate,
    );
    if (candidateStatus.withinCapacity) {
      primary.push(ticket);
    } else {
      secondary.push(ticket);
    }
  }

  return { primary, secondary, overflows: status.overflows };
}
