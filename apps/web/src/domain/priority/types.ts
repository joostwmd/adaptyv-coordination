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
  total: number;
  band: "high" | "medium" | "low";
  breakdown: PriorityBreakdownEntry[];
  topDriver: string;
};

export type PriorityWeights = Record<PriorityDimension, number>;

export type TicketPriorityContext = {
  experimentPriority: number;
  experimentCategory: "rd" | "production";
  customerTier: number;
  deadlineDays?: number;
  createdAt: string;
};
