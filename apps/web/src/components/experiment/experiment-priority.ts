/** Priority on the experiment record in LabOS (absolute score, not the 0–1000 planning score). */
export const EXPERIMENT_PRIORITY_LABEL = "LabOS priority";

export const EXPERIMENT_PRIORITY_HINT = "Absolute priority from LabOS";

export function formatExperimentPriority(priority: number): string {
  return priority.toLocaleString();
}
