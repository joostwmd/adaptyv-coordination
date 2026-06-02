import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@adaptyv-coordination/ui/components/hover-card";

import type { ExperimentRunSummary, ExperimentSummary } from "@/types";

import { ExperimentRunHoverPreview } from "./experiment-run-hover-preview";

type ExperimentRunLinkProps = {
  run: ExperimentRunSummary;
  experiment: ExperimentSummary;
};

export function ExperimentRunLink({ run, experiment }: ExperimentRunLinkProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">Run</span>
      <HoverCard>
        <HoverCardTrigger
          className="w-fit cursor-default text-xs font-medium underline-offset-4 hover:underline"
          onClick={(event) => event.stopPropagation()}
        >
          R{run.revisionIndex} · {run.name}
        </HoverCardTrigger>
        <HoverCardContent side="top" align="start" className="w-72">
          <ExperimentRunHoverPreview run={run} experiment={experiment} />
        </HoverCardContent>
      </HoverCard>
    </div>
  );
}
