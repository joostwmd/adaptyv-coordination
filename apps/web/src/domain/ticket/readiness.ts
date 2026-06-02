import { getMissingRequiredParams } from "@/domain/task-template/param-schema";
import { getTaskTemplate } from "@/domain/task-template/catalog";
import type { Ticket, TicketReadiness } from "./types";

export function computeReadiness(
  ticket: Ticket,
  allTickets: Ticket[],
): TicketReadiness {
  if (ticket.readiness === "in_labos") {
    return "in_labos";
  }
  if (ticket.batchId) {
    return "batched";
  }
  if (ticket.blockedReason) {
    return "blocked";
  }

  const template = getTaskTemplate(ticket.taskTemplateId);
  if (template) {
    const missing = getMissingRequiredParams(template.paramSchema, ticket.params);
    if (missing.length > 0) {
      return "blocked";
    }
  }

  if (ticket.dependsOn.length > 0) {
    const byId = new Map(allTickets.map((t) => [t.id, t]));
    const upstreamReady = ticket.dependsOn.every((depId) => {
      const dep = byId.get(depId);
      return dep?.readiness === "in_labos";
    });
    if (!upstreamReady) {
      return "waiting_upstream";
    }
  }

  return "ready";
}

export function refreshTicketReadiness(
  ticket: Ticket,
  allTickets: Ticket[],
): Ticket {
  return { ...ticket, readiness: computeReadiness(ticket, allTickets) };
}

export function refreshAllTicketReadiness(tickets: Ticket[]): Ticket[] {
  return tickets.map((t) => refreshTicketReadiness(t, tickets));
}
