import { Link } from "@tanstack/react-router";
import { cn } from "@adaptyv-coordination/ui/lib/utils";
import type { MouseEvent } from "react";

import type { ExperimentSummary } from "@/types";

import { ExperimentHoverCard } from "./experiment-hover-card";

type ExperimentCodeHoverProps = {
  experiment: ExperimentSummary;
  className?: string;
  linkClassName?: string;
  stopPropagation?: boolean;
};

export function ExperimentCodeHover({
  experiment,
  className,
  linkClassName,
  stopPropagation = true,
}: ExperimentCodeHoverProps) {
  function handleClick(event: MouseEvent) {
    if (stopPropagation) {
      event.stopPropagation();
    }
  }

  return (
    <span className={cn("inline-flex", className)}>
      <ExperimentHoverCard
        experiment={experiment}
        trigger={
          <Link
            to="/experiments/$experimentId"
            params={{ experimentId: experiment.id }}
            className={cn(
              "font-mono font-semibold text-foreground underline-offset-4 hover:underline",
              linkClassName,
            )}
            onClick={handleClick}
          >
            {experiment.code}
          </Link>
        }
      />
    </span>
  );
}
