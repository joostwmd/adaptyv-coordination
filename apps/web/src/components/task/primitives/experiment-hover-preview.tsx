import { MetaRow } from "@/components/context/primitives/meta-row";
import {
  EXPERIMENT_CATEGORY_LABEL,
  EXPERIMENT_TYPE_LABEL,
  type ExperimentSummary,
} from "@/types";

type ExperimentHoverPreviewProps = {
  experiment: ExperimentSummary;
};

export function ExperimentHoverPreview({ experiment }: ExperimentHoverPreviewProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-xs font-medium">{experiment.name}</p>
      <MetaRow label="Code" value={experiment.code} />
      <MetaRow label="Priority" value={experiment.priority.toLocaleString()} />
      <MetaRow label="Type" value={EXPERIMENT_TYPE_LABEL[experiment.type]} />
      <MetaRow label="Category" value={EXPERIMENT_CATEGORY_LABEL[experiment.category]} />
      <MetaRow label="Client" value={experiment.client.name} />
      <MetaRow label="Status" value={experiment.status.name} />
    </div>
  );
}
