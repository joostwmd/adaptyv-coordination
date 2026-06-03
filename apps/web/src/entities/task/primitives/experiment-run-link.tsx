import { ExperimentRunHoverCard } from "@/components/experiment/experiment-run-hover-card";
import { useExperimentById } from "@/stores/usePrototypeStore";

type ExperimentRunLinkProps = {
  experimentId: string;
  runId: string;
};

export function ExperimentRunLink({
  experimentId,
  runId,
}: ExperimentRunLinkProps) {
  const experiment = useExperimentById(experimentId);
  const run = experiment?.runs.find((entry) => entry.id === runId);

  if (!experiment || !run) {
    return null;
  }

  const { runs: _runs, ...summary } = experiment;

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">Run</span>
      <ExperimentRunHoverCard
        run={run}
        experiment={summary}
        trigger={
          <button
            type="button"
            className="w-fit cursor-default text-xs font-medium underline-offset-4 hover:underline"
            onClick={(event) => event.stopPropagation()}
          >
            R{run.revisionIndex} · {run.name}
          </button>
        }
      />
    </div>
  );
}
