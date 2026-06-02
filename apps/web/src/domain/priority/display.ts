import type { PriorityBreakdownEntry, PriorityScore } from "./types";

/** Normalized planning priority scale (0–1000). */
export const PRIORITY_DISPLAY_MAX = 1000;

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

export function toDisplayScore(normalized: number): number {
  return Math.round(clamp01(normalized) * PRIORITY_DISPLAY_MAX);
}

export function getPriorityBand(
  normalized: number,
): PriorityScore["band"] {
  const n = clamp01(normalized);
  if (n >= 0.65) return "high";
  if (n >= 0.4) return "medium";
  return "low";
}

export function dimensionDisplayScore(raw: number): number {
  return toDisplayScore(raw);
}

/** Tooltip rows: highest normalized dimension score first. */
export function sortBreakdownByDimensionScore(
  breakdown: PriorityBreakdownEntry[],
): PriorityBreakdownEntry[] {
  return [...breakdown].sort(
    (a, b) => dimensionDisplayScore(b.raw) - dimensionDisplayScore(a.raw),
  );
}
