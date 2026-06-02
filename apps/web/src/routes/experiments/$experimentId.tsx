import { Link, createFileRoute } from "@tanstack/react-router";

import { MetaRow } from "@/components/context/primitives/meta-row";
import { useExperiment } from "@/hooks/useExperiments";
import {
  EXPERIMENT_CATEGORY_LABEL,
  EXPERIMENT_TYPE_LABEL,
} from "@/types";

export const Route = createFileRoute("/experiments/$experimentId")({
  component: ExperimentDetailPage,
});

function ExperimentDetailPage() {
  const { experimentId } = Route.useParams();
  const { experiment } = useExperiment(experimentId);

  if (!experiment) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <Link to="/" className="text-xs text-muted-foreground underline-offset-4 hover:underline">
          Back to home
        </Link>
        <h1 className="mt-4 text-sm font-medium">Experiment details</h1>
        <p className="mt-2 text-xs text-muted-foreground">Experiment not found: {experimentId}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <Link to="/" className="text-xs text-muted-foreground underline-offset-4 hover:underline">
        Back to home
      </Link>

      <div className="mt-4 rounded-lg border p-4">
        <h1 className="text-sm font-medium">{experiment.name}</h1>
        <p className="mt-1 text-xs text-muted-foreground">Experiment details</p>

        <div className="mt-4 flex flex-col gap-2">
          <MetaRow label="Code" value={experiment.code} />
          <MetaRow label="Priority" value={experiment.priority.toLocaleString()} />
          <MetaRow label="Type" value={EXPERIMENT_TYPE_LABEL[experiment.type]} />
          <MetaRow label="Category" value={EXPERIMENT_CATEGORY_LABEL[experiment.category]} />
          <MetaRow label="Client" value={experiment.client.name} />
          <MetaRow label="Status" value={experiment.status.name} />
          {experiment.methodName ? (
            <MetaRow label="Method" value={experiment.methodName} />
          ) : null}
        </div>
      </div>
    </div>
  );
}
