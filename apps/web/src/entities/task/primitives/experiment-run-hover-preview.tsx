import { MetaRow } from "@/components/context/primitives/meta-row";
import type { ExperimentRunSummary, ExperimentSummary } from "@/types";

type ExperimentRunHoverPreviewProps = {
  run: ExperimentRunSummary;
  experiment: ExperimentSummary;
};

export function ExperimentRunHoverPreview({ run, experiment }: ExperimentRunHoverPreviewProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-xs font-medium">{run.name}</p>
      <MetaRow label="Revision" value={run.revisionIndex} />
      <MetaRow label="Experiment" value={experiment.code} />
    </div>
  );
}
