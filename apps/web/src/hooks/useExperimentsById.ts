import { useMemo } from "react";

import { buildExperimentsById } from "@/domain/experiment";
import { usePrototypeStore } from "@/stores/usePrototypeStore";
import type { ExperimentSummary } from "@/types";

export { buildExperimentsById } from "@/domain/experiment";

export function useExperimentsById(): Record<string, ExperimentSummary> {
  const experiments = usePrototypeStore((s) => s.experiments);
  return useMemo(() => buildExperimentsById(experiments), [experiments]);
}
