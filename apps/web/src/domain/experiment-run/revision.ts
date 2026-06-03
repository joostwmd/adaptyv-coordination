import type { ExperimentDetail, ExperimentRunSummary } from "@/types/experiment";

export function nextRevisionIndex(runs: ExperimentRunSummary[]): number {
  if (runs.length === 0) return 1;
  return Math.max(...runs.map((run) => run.revisionIndex)) + 1;
}

export function defaultRunName(experiment: ExperimentDetail): string {
  return `Revision ${nextRevisionIndex(experiment.runs)}`;
}
