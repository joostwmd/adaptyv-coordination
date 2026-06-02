export const BLOCKED_REASONS = [
  "missing_materials",
  "awaiting_client",
  "upstream_not_done",
  "missing_params",
  "other",
] as const;

export type BlockedReason = (typeof BLOCKED_REASONS)[number];

export const BLOCKED_REASON_LABEL: Record<BlockedReason, string> = {
  missing_materials: "Missing materials",
  awaiting_client: "Awaiting client",
  upstream_not_done: "Upstream not done",
  missing_params: "Missing parameters",
  other: "Other",
};
