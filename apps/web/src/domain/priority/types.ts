export type PriorityDimension =
  | "customerTier"
  | "deadlineProximity"
  | "category"
  | "inheritedExperiment"
  | "impact"
  | "waitingAge"
  | "rerunBoost";

export type PriorityBreakdownEntry = {
  dimension: PriorityDimension;
  raw: number;
  weighted: number;
  label: string;
};

export type PriorityScore = {
  /** Weighted sum of normalized dimensions (0–1). */
  total: number;
  /** Same scale as UI badge (0–1000). */
  displayScore: number;
  band: "high" | "medium" | "low";
  breakdown: PriorityBreakdownEntry[];
  topDriver: string;
};

export type PriorityWeights = Record<PriorityDimension, number>;

export type TaskPriorityContext = {
  experimentPriority: number;
  experimentCategory: "rd" | "production";
  customerTier: number;
  deadlineDays?: number;
  createdAt: string;
};
