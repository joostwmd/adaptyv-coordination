import type { ExperimentDetail, ExperimentSummary } from "@/types";

export function buildExperimentsById(
  experiments: ExperimentDetail[],
): Record<string, ExperimentSummary> {
  return Object.fromEntries(
    experiments.map((experiment) => {
      const { runs: _runs, ...summary } = experiment;
      return [experiment.id, summary];
    }),
  ) as Record<string, ExperimentSummary>;
}
