import { getTaskTemplate } from "@/domain/task-template/catalog";
import type { Ticket } from "@/domain/ticket/types";
import type {
  PriorityBreakdownEntry,
  PriorityScore,
  PriorityWeights,
  TicketPriorityContext,
} from "./types";
import { DEFAULT_PRIORITY_WEIGHTS } from "./weights";

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

function normalizeExperimentPriority(priority: number): number {
  return clamp01(priority / 15_000_000);
}

function bandFromTotal(total: number): PriorityScore["band"] {
  if (total >= 0.65) return "high";
  if (total >= 0.4) return "medium";
  return "low";
}

export function scoreTicket(
  ticket: Ticket,
  ctx: TicketPriorityContext,
  weights: PriorityWeights = DEFAULT_PRIORITY_WEIGHTS,
): PriorityScore {
  const template = getTaskTemplate(ticket.taskTemplateId);
  const impactRaw =
    ticket.origin === "standalone" ? 0 : clamp01((template?.impactWeight ?? 5) / 10);

  const customerTierRaw = clamp01(ctx.customerTier / 5);
  const deadlineRaw =
    ctx.deadlineDays === undefined
      ? 0.5
      : clamp01(1 - ctx.deadlineDays / 30);
  const categoryRaw = ctx.experimentCategory === "production" ? 1 : 0.4;
  const inheritedRaw = normalizeExperimentPriority(ctx.experimentPriority);

  const ageDays =
    (Date.now() - new Date(ctx.createdAt).getTime()) / (1000 * 60 * 60 * 24);
  const waitingRaw = clamp01(ageDays / 14);

  const rerunRaw = ticket.origin === "rerun" ? 1 : 0;

  const entries: Array<{
    dimension: PriorityBreakdownEntry["dimension"];
    raw: number;
    label: string;
  }> = [
    { dimension: "customerTier", raw: customerTierRaw, label: "Customer tier" },
    {
      dimension: "deadlineProximity",
      raw: deadlineRaw,
      label: ctx.deadlineDays !== undefined ? `Deadline in ${ctx.deadlineDays}d` : "Deadline",
    },
    {
      dimension: "category",
      raw: categoryRaw,
      label: ctx.experimentCategory === "production" ? "Production" : "R&D",
    },
    {
      dimension: "inheritedExperiment",
      raw: inheritedRaw,
      label: "Experiment priority",
    },
    {
      dimension: "impact",
      raw: impactRaw,
      label:
        ticket.origin === "standalone"
          ? "Standalone (no pipeline impact)"
          : `Impact ${template?.impactWeight ?? 0}`,
    },
    { dimension: "waitingAge", raw: waitingRaw, label: `Waiting ${Math.floor(ageDays)}d` },
    { dimension: "rerunBoost", raw: rerunRaw, label: ticket.origin === "rerun" ? "Rerun" : "—" },
  ];

  const breakdown: PriorityBreakdownEntry[] = entries.map((e) => ({
    dimension: e.dimension,
    raw: e.raw,
    weighted: e.raw * weights[e.dimension],
    label: e.label,
  }));

  const total = breakdown.reduce((sum, b) => sum + b.weighted, 0);
  const top = [...breakdown].sort((a, b) => b.weighted - a.weighted)[0];

  return {
    total,
    band: bandFromTotal(total),
    breakdown,
    topDriver: top?.label ?? "—",
  };
}

export function buildTicketPriorityContext(
  experimentPriority: number,
  experimentCategory: "rd" | "production",
  options: {
    customerTier?: number;
    deadlineDays?: number;
    createdAt?: string;
  } = {},
): TicketPriorityContext {
  return {
    experimentPriority,
    experimentCategory,
    customerTier: options.customerTier ?? 3,
    deadlineDays: options.deadlineDays,
    createdAt: options.createdAt ?? new Date().toISOString(),
  };
}
