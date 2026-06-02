import { groupIntoDraftBatches } from "@/domain/batch";
import { refreshAllTicketReadiness } from "@/domain/ticket";
import {
  createStandaloneTicket,
  resetTicketIdCounter,
  scaffoldTickets,
} from "@/domain/ticket/scaffold";
import { resetBatchIdCounter } from "@/domain/batch/grouping";
import { getWorkflowTemplate } from "@/domain/workflow";
import type { Batch } from "@/domain/batch/types";
import type { Ticket } from "@/domain/ticket/types";
import type { ExperimentDetail, StaffMember } from "@/types";
import { seedExperiments, seedStaff } from "@/data/seedData";

export type PlanningSeedData = {
  tickets: Ticket[];
  batches: Batch[];
};

function toSummary(experiment: ExperimentDetail) {
  const { runs: _runs, ...summary } = experiment;
  return summary;
}

export function buildPlanningSeedData(): PlanningSeedData {
  resetTicketIdCounter(1000);
  resetBatchIdCounter(2000);

  const tickets: Ticket[] = [];

  const medcore = seedExperiments.find((e) => e.id === "exp-medcore-screen");
  const acme = seedExperiments.find((e) => e.id === "exp-acme-expression");
  const production = seedExperiments.find((e) => e.id === "exp-production-1");

  if (medcore) {
    const wf =
      getWorkflowTemplate(medcore.type, medcore.methodName) ??
      getWorkflowTemplate("binding_screening");
    if (wf) {
      tickets.push(...scaffoldTickets(toSummary(medcore), wf));
    }
  }

  if (acme) {
    const wf = getWorkflowTemplate(acme.type, acme.methodName);
    if (wf) {
      tickets.push(...scaffoldTickets(toSummary(acme), wf));
    }
  }

  if (production) {
    const wf = getWorkflowTemplate(production.type, production.methodName);
    if (wf) {
      tickets.push(...scaffoldTickets(toSummary(production), wf));
    }
  }

  tickets.push(
    createStandaloneTicket("01944581-afc2-2a97-3ba6-14b9cbc54691", {
      buffer_k: 2,
      buffer_be: 1,
      buffer_r: 0.5,
    }),
  );

  let refreshed = refreshAllTicketReadiness(tickets);

  const readyForBatch = refreshed.filter((t) => t.readiness === "ready");
  const draftBatches = groupIntoDraftBatches(readyForBatch);

  const exprRunTickets = readyForBatch.filter(
    (t) => t.taskTemplateId === "3e7749a4-d7b7-44a8-b1f3-e2e61dbba64c",
  );
  if (exprRunTickets.length >= 2) {
    const overflowBatch = draftBatches.find(
      (b) => b.taskTemplateId === "3e7749a4-d7b7-44a8-b1f3-e2e61dbba64c",
    );
    if (overflowBatch) {
      overflowBatch.ticketIds = exprRunTickets.map((t) => t.id);
    }
  }

  refreshed = refreshed.map((t) => {
    const batch = draftBatches.find((b) => b.ticketIds.includes(t.id));
    if (batch) {
      return { ...t, batchId: batch.id, readiness: "batched" as const };
    }
    return t;
  });

  const batches: Batch[] = draftBatches.map((b) => ({
    ...b,
    assigneeIds: [seedStaff[0]!.id],
    scheduledDay: "2026-06-03",
    notes: [
      {
        id: "batch-note-1",
        author: seedStaff[0] as StaffMember,
        body: "Run expression batch before overnight BLI window.",
        createdAt: "2026-06-02T10:00:00.000Z",
      },
    ],
  }));

  return { tickets: refreshed, batches };
}

/** Sanity check used during development — returns true when pipeline is coherent. */
export function validatePlanningSeed(data: PlanningSeedData): boolean {
  return data.tickets.length > 0 && data.batches.length > 0;
}
