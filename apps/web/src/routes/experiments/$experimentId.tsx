import { Link, createFileRoute } from "@tanstack/react-router";

import { MetaRow } from "@/components/context/primitives/meta-row";
import {
  EXPERIMENT_PRIORITY_LABEL,
  formatExperimentPriority,
} from "@/components/experiment";
import { useExperiment } from "@/hooks/useExperiments";
import {
  EXPERIMENT_CATEGORY_LABEL,
  EXPERIMENT_TYPE_LABEL,
} from "@/types/experiment";
import { Badge } from "@adaptyv-coordination/ui/components/badge";

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
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link to="/experiments" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
            ← Back to experiments
          </Link>
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-lg border p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-semibold">{experiment.name}</h1>
              <p className="text-sm text-muted-foreground mt-1">{experiment.code}</p>
            </div>
            <Badge variant={experiment.status === 'synced' ? 'outline' : 'default'}>
              {experiment.status.charAt(0).toUpperCase() + experiment.status.slice(1)}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MetaRow
              label={EXPERIMENT_PRIORITY_LABEL}
              value={formatExperimentPriority(experiment.priority)}
            />
            <MetaRow label="Type" value={EXPERIMENT_TYPE_LABEL[experiment.type]} />
            <MetaRow label="Category" value={EXPERIMENT_CATEGORY_LABEL[experiment.category]} />
            <MetaRow label="Client" value={experiment.client.name} />
            {experiment.methodName ? (
              <MetaRow label="Method" value={experiment.methodName} />
            ) : null}
            {experiment.dueDate ? (
              <MetaRow label="Due Date" value={experiment.dueDate} />
            ) : null}
          </div>
        </div>

        <div className="rounded-lg border p-6">
          <h2 className="text-lg font-medium mb-4">Experiment Runs</h2>
          {experiment.runs && experiment.runs.length > 0 ? (
            <div className="space-y-3">
              {experiment.runs.map((run) => (
                <div key={run.id} className="flex items-center justify-between p-3 rounded-md border">
                  <div>
                    <div className="font-medium">{run.name}</div>
                    <div className="text-sm text-muted-foreground">Revision {run.revisionIndex}</div>
                  </div>
                  <Badge variant={
                    run.status === 'completed' ? 'default' :
                    run.status === 'in_progress' ? 'secondary' :
                    run.status === 'failed' ? 'destructive' : 'outline'
                  }>
                    {run.status.charAt(0).toUpperCase() + run.status.slice(1)}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No runs created yet</p>
              <p className="text-sm mt-1">Create your first run to start working with this experiment</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
