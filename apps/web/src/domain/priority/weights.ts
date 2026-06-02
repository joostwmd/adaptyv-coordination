import type { PriorityWeights } from "./types";

export const DEFAULT_PRIORITY_WEIGHTS: PriorityWeights = {
  customerTier: 0.15,
  deadlineProximity: 0.25,
  category: 0.1,
  inheritedExperiment: 0.2,
  impact: 0.2,
  waitingAge: 0.05,
  rerunBoost: 0.05,
};

export const PRIORITY_WEIGHT_PRESETS: Record<string, PriorityWeights> = {
  default: DEFAULT_PRIORITY_WEIGHTS,
  deadline: {
    customerTier: 0.1,
    deadlineProximity: 0.4,
    category: 0.1,
    inheritedExperiment: 0.15,
    impact: 0.15,
    waitingAge: 0.05,
    rerunBoost: 0.05,
  },
  throughput: {
    customerTier: 0.1,
    deadlineProximity: 0.1,
    category: 0.05,
    inheritedExperiment: 0.15,
    impact: 0.45,
    waitingAge: 0.1,
    rerunBoost: 0.05,
  },
};
