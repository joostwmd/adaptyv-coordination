import { getTaskTemplate } from "@/domain/task-template/catalog";
import type { Task } from "@/domain/task/types";
import type {
  PriorityBreakdownEntry,
  PriorityScore,
  PriorityWeights,
  TaskPriorityContext,
} from "./types";
import { getPriorityBand, toDisplayScore } from "./display";
import { DEFAULT_PRIORITY_WEIGHTS } from "./weights";

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

function normalizeExperimentPriority(priority: number): number {
  return clamp01(priority / 15_000_000);
}

export function scoreTask(
  task: Task,
  ctx: TaskPriorityContext,
  weights: PriorityWeights = DEFAULT_PRIORITY_WEIGHTS,
): PriorityScore {
  const template = getTaskTemplate(task.taskTemplateId);
  const impactRaw =
    task.origin === "standalone" ? 0 : clamp01((template?.impactWeight ?? 5) / 10);

  const customerTierRaw = clamp01(ctx.customerTier / 5);
  const deadlineRaw =
    ctx.deadlineDays === undefined ? 0.5 : clamp01(1 - ctx.deadlineDays / 30);
  const categoryRaw = ctx.experimentCategory === "production" ? 1 : 0.4;
  const inheritedRaw = normalizeExperimentPriority(ctx.experimentPriority);

  const ageDays =
    (Date.now() - new Date(ctx.createdAt).getTime()) / (1000 * 60 * 60 * 24);
  const waitingRaw = clamp01(ageDays / 14);

  const rerunRaw = task.origin === "rerun" ? 1 : 0;

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
      label: "LabOS priority",
    },
    {
      dimension: "impact",
      raw: impactRaw,
      label:
        task.origin === "standalone"
          ? "Standalone (no pipeline impact)"
          : "Pipeline impact",
    },
    { dimension: "waitingAge", raw: waitingRaw, label: `Waiting ${Math.floor(ageDays)}d` },
    { dimension: "rerunBoost", raw: rerunRaw, label: task.origin === "rerun" ? "Rerun" : "—" },
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
    displayScore: toDisplayScore(total),
    band: getPriorityBand(total),
    breakdown,
    topDriver: top?.label ?? "—",
  };
}

export function buildTaskPriorityContext(
  experimentPriority: number,
  experimentCategory: "rd" | "production",
  options: {
    customerTier?: number;
    deadlineDays?: number;
    createdAt?: string;
  } = {},
): TaskPriorityContext {
  return {
    experimentPriority,
    experimentCategory,
    customerTier: options.customerTier ?? 3,
    deadlineDays: options.deadlineDays,
    createdAt: options.createdAt ?? new Date().toISOString(),
  };
}