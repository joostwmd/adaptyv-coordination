import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@adaptyv-coordination/ui/components/hover-card";
import { Link } from "@tanstack/react-router";

import type { ExperimentSummary } from "@/types";

import { ExperimentHoverPreview } from "./experiment-hover-preview";

type ExperimentLinkProps = {
  experiment: ExperimentSummary;
};

export function ExperimentLink({ experiment }: ExperimentLinkProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">Experiment</span>
      <HoverCard>
        <HoverCardTrigger
          render={
            <Link
              to="/experiments/$experimentId"
              params={{ experimentId: experiment.id }}
              className="w-fit text-xs font-medium underline-offset-4 hover:underline"
              onClick={(event) => event.stopPropagation()}
            />
          }
        >
          {experiment.code} · {experiment.name}
        </HoverCardTrigger>
        <HoverCardContent side="top" align="start" className="w-72">
          <ExperimentHoverPreview experiment={experiment} />
        </HoverCardContent>
      </HoverCard>
    </div>
  );
}
