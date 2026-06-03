import { cn } from "@adaptyv-coordination/ui/lib/utils";

import { ExperimentCodeHover } from "@/entities/experiment/experiment-code-hover";
import type { ExperimentSummary } from "@/types";

type ExperimentLinkProps = {
  experiment: ExperimentSummary;
  showLabel?: boolean;
  className?: string;
  /** Only the experiment code is hoverable; name is plain text when shown. */
  codeOnly?: boolean;
  /** Show experiment name after the code (only with codeOnly). */
  showName?: boolean;
};

export function ExperimentLink({
  experiment,
  showLabel = true,
  className,
  codeOnly = false,
  showName = true,
}: ExperimentLinkProps) {
  if (codeOnly) {
    return (
      <div className={cn("flex flex-col items-start gap-0.5 text-xs", className)}>
        {showLabel ? (
          <span className="text-muted-foreground">Experiment</span>
        ) : null}
        <ExperimentCodeHover
          experiment={experiment}
          linkClassName="text-xs font-medium"
        />
        {showName ? (
          <span className="text-muted-foreground leading-snug">{experiment.name}</span>
        ) : null}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {showLabel ? (
        <span className="text-xs text-muted-foreground">Experiment</span>
      ) : null}
      <ExperimentCodeHover
        experiment={experiment}
        linkClassName="text-xs font-medium"
      />
    </div>
  );
}
