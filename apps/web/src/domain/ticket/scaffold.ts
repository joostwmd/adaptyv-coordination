import { getDefaultParams } from "@/domain/task-template/param-schema";
import { getTaskTemplate } from "@/domain/task-template/catalog";
import type { WorkflowTemplate } from "@/domain/workflow/types";
import type { ExperimentSummary } from "@/types";
import type { Ticket, TicketOrigin } from "./types";
import { refreshAllTicketReadiness } from "./readiness";

let ticketIdCounter = 0;

export function resetTicketIdCounter(seed = 0): void {
  ticketIdCounter = seed;
}

export function nextTicketId(prefix = "ticket"): string {
  ticketIdCounter += 1;
  return `${prefix}-${ticketIdCounter}`;
}

function buildTicket(
  taskTemplateId: string,
  experimentIds: string[],
  origin: TicketOrigin,
  options: {
    params?: Record<string, unknown>;
    dependsOn?: string[];
    parentTicketId?: string;
    name?: string;
    id?: string;
  } = {},
): Ticket {
  const template = getTaskTemplate(taskTemplateId);
  const params = {
    ...(template ? getDefaultParams(template.paramSchema) : {}),
    ...options.params,
  };

  return {
    id: options.id ?? nextTicketId(),
    taskTemplateId,
    name: options.name ?? template?.name,
    origin,
    parentTicketId: options.parentTicketId,
    experimentIds,
    params,
    dependsOn: options.dependsOn ?? [],
    readiness: "ready",
    createdAt: new Date().toISOString(),
  };
}

export function scaffoldTickets(
  experiment: ExperimentSummary,
  workflow: WorkflowTemplate,
): Ticket[] {
  const tickets: Ticket[] = [];
  let previousId: string | undefined;

  for (const step of workflow.steps) {
    if (step.optional) {
      continue;
    }

    const ticket = buildTicket(step.taskTemplateId, [experiment.id], "template", {
      params: step.paramOverrides,
      dependsOn: previousId ? [previousId] : [],
      name: `${getTaskTemplate(step.taskTemplateId)?.name ?? "Task"} — ${experiment.code}`,
    });
    tickets.push(ticket);
    previousId = ticket.id;
  }

  return refreshAllTicketReadiness(tickets);
}

export function createStandaloneTicket(
  taskTemplateId: string,
  params: Record<string, unknown> = {},
  experimentIds: string[] = [],
): Ticket {
  const ticket = buildTicket(taskTemplateId, experimentIds, "standalone", { params });
  return refreshAllTicketReadiness([ticket])[0]!;
}

export function createRerunTickets(sourceTickets: Ticket[]): Ticket[] {
  const reruns = sourceTickets.map((source) =>
    buildTicket(source.taskTemplateId, [...source.experimentIds], "rerun", {
      params: { ...source.params },
      parentTicketId: source.id,
      dependsOn: [],
      name: `Rerun: ${source.name ?? source.taskTemplateId}`,
    }),
  );
  return refreshAllTicketReadiness(reruns);
}
