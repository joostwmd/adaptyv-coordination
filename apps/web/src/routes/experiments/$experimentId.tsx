import { Link, createFileRoute } from "@tanstack/react-router";

import { ExperimentDetailScreen } from "@/components/experiment";
import { useExperiment } from "@/hooks/useExperiments";

export const Route = createFileRoute("/experiments/$experimentId")({
  component: ExperimentDetailPage,
});

function ExperimentDetailPage() {
  const { experimentId } = Route.useParams();
  const { experiment } = useExperiment(experimentId);

  if (!experiment) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="container mx-auto max-w-3xl px-4 py-8">
          <Link
            to="/experiments"
            className="text-xs text-muted-foreground underline-offset-4 hover:underline"
          >
            ← Back to experiments
          </Link>
          <h1 className="mt-4 text-sm font-medium">Experiment details</h1>
          <p className="mt-2 text-xs text-muted-foreground">
            Experiment not found: {experimentId}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full min-h-0">
      <ExperimentDetailScreen experiment={experiment} />
    </div>
  );
}
