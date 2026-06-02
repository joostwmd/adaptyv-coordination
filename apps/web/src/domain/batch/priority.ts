import {
  buildTicketPriorityContext,
  scoreTicket,
  type PriorityWeights,
} from "@/domain/priority";
import type { ExperimentSummary } from "@/types";
import type { Ticket } from "@/domain/ticket/types";
import type { Batch, BatchPriority } from "./types";
import { DEFAULT_PRIORITY_WEIGHTS } from "@/domain/priority/weights";

export function computeBatchPriority(
  batch: Batch,
  tickets: Ticket[],
  experimentsById: Record<string, ExperimentSummary>,
  weights: PriorityWeights = DEFAULT_PRIORITY_WEIGHTS,
): BatchPriority | null {
  const memberTickets = tickets.filter((t) => batch.ticketIds.includes(t.id));
  if (memberTickets.length === 0) return null;

  let bestScore = -1;
  let driverTicketId = memberTickets[0]!.id;

  for (const ticket of memberTickets) {
    const exp = experimentsById[ticket.experimentIds[0] ?? ""];
    const ctx = buildTicketPriorityContext(
      exp?.priority ?? 0,
      exp?.category ?? "rd",
      {
        customerTier: exp?.category === "production" ? 4 : 2,
        deadlineDays: undefined,
        createdAt: ticket.createdAt,
      },
    );
    const { total } = scoreTicket(ticket, ctx, weights);
    if (total > bestScore) {
      bestScore = total;
      driverTicketId = ticket.id;
    }
  }

  return { score: bestScore, driverTicketId };
}
