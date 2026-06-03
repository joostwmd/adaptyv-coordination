import { useMemo } from "react";

import { usePrototypeStore } from "@/stores/usePrototypeStore";
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

export function useExperimentsById(): Record<string, ExperimentSummary> {
  const experiments = usePrototypeStore((s) => s.experiments);
  return useMemo(() => buildExperimentsById(experiments), [experiments]);
}
