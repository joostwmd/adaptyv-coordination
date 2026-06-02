import type { PriorityDimension, PriorityWeights } from "./types";
import {
  DEFAULT_PRIORITY_WEIGHTS,
  PRIORITY_WEIGHT_PRESETS,
} from "./weights";

export type PriorityPresetName = keyof typeof PRIORITY_WEIGHT_PRESETS;

export type PriorityDimensionMeta = {
  key: PriorityDimension;
  /** Weight slider label */
  label: string;
  /** Short symbol in the live formula */
  shortLabel: string;
  /** Plain-language explanation for planners */
  description: string;
  /** Compact math reference (shown secondary) */
  factorHint: string;
};

export const PRIORITY_DIMENSION_META: PriorityDimensionMeta[] = [
  {
    key: "customerTier",
    label: "Client priority",
    shortLabel: "client",
    description: "Higher-tier clients (1–5) score higher. From the client record on the experiment.",
    factorHint: "tier ÷ 5",
  },
  {
    key: "deadlineProximity",
    label: "Due date urgency",
    shortLabel: "due",
    description: "Experiments due sooner on the planning calendar score higher. Uses each experiment’s due date.",
    factorHint: "1 − (days until due ÷ 30)",
  },
  {
    key: "category",
    label: "Work type",
    shortLabel: "type",
    description: "Production experiments score above R&D on this factor.",
    factorHint: "production = 1 · R&D = 0.4",
  },
  {
    key: "inheritedExperiment",
    label: "LabOS rank",
    shortLabel: "labos",
    description: "Pulls the absolute priority number from the experiment in LabOS.",
    factorHint: "LabOS priority ÷ 15,000,000",
  },
  {
    key: "impact",
    label: "Downstream impact",
    shortLabel: "impact",
    description: "Task types that unblock more of the pipeline score higher. Standalone tasks score 0.",
    factorHint: "template impact ÷ 10",
  },
  {
    key: "waitingAge",
    label: "Time waiting",
    shortLabel: "wait",
    description: "Ready tasks that have sat in the queue longer score higher, up to 14 days.",
    factorHint: "days waiting ÷ 14",
  },
  {
    key: "rerunBoost",
    label: "Rerun",
    shortLabel: "rerun",
    description: "Tasks created from a failed or repeated run get a fixed boost.",
    factorHint: "rerun = 1 · otherwise = 0",
  },
];

export const PRIORITY_PRESET_LABELS: Record<PriorityPresetName, string> = {
  default: "Balanced",
  deadline: "Due dates",
  throughput: "Throughput",
};

const WEIGHT_EPSILON = 0.001;

function weightsMatch(a: PriorityWeights, b: PriorityWeights): boolean {
  return PRIORITY_DIMENSION_META.every(
    ({ key }) => Math.abs(a[key] - b[key]) < WEIGHT_EPSILON,
  );
}

export function detectActivePreset(
  weights: PriorityWeights,
): PriorityPresetName | "custom" {
  for (const name of Object.keys(PRIORITY_WEIGHT_PRESETS) as PriorityPresetName[]) {
    if (weightsMatch(weights, PRIORITY_WEIGHT_PRESETS[name])) {
      return name;
    }
  }
  return "custom";
}

export function sumPriorityWeights(weights: PriorityWeights): number {
  return PRIORITY_DIMENSION_META.reduce((sum, { key }) => sum + weights[key], 0);
}

export function formatPriorityFormula(weights: PriorityWeights): string {
  const terms = PRIORITY_DIMENSION_META.map(
    ({ shortLabel, key }) => `${weights[key].toFixed(2)}×${shortLabel}`,
  ).join(" + ");

  return `score = ${terms}\ndisplay = round(clamp(score, 0, 1) × 1000)`;
}

export function formatPriorityFactors(): string {
  return PRIORITY_DIMENSION_META.map(({ label, factorHint }) => `${label}: ${factorHint}`).join(
    "\n",
  );
}

export { DEFAULT_PRIORITY_WEIGHTS, PRIORITY_WEIGHT_PRESETS };
