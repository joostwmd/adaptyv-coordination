import { Link } from "@tanstack/react-router";
import { cn } from "@adaptyv-coordination/ui/lib/utils";

import { ExperimentHoverCard } from "@/components/experiment";
import type { ExperimentSummary } from "@/types";

type ExperimentLinkProps = {
  experiment: ExperimentSummary;
  showLabel?: boolean;
  className?: string;
};

export function ExperimentLink({
  experiment,
  showLabel = true,
  className,
}: ExperimentLinkProps) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {showLabel ? (
        <span className="text-xs text-muted-foreground">Experiment</span>
      ) : null}
      <ExperimentHoverCard
        experiment={experiment}
        trigger={
          <Link
            to="/experiments/$experimentId"
            params={{ experimentId: experiment.id }}
            className="w-fit text-xs font-medium underline-offset-4 hover:underline"
            onClick={(event) => event.stopPropagation()}
          >
            {experiment.code} · {experiment.name}
          </Link>
        }
      />
    </div>
  );
}
