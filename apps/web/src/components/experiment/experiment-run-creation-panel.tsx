import { X } from "lucide-react";

import { Button } from "@adaptyv-coordination/ui/components/button";
import { nextRevisionIndex } from "@/domain/experiment-run/revision";
import type { ExperimentDetail } from "@/types";

import { RunCreationWizard } from "./run-creation/run-creation-wizard";

type ExperimentRunCreationPanelProps = {
  experiment: ExperimentDetail;
  onClose: () => void;
};

export function ExperimentRunCreationPanel({
  experiment,
  onClose,
}: ExperimentRunCreationPanelProps) {
  return (
    <div className="flex h-full min-h-0 flex-col border-t bg-background">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b px-4 py-3">
        <div>
          <h2 className="text-sm font-medium">Create new run</h2>
          <p className="text-xs text-muted-foreground">
            {experiment.code} · Revision {nextRevisionIndex(experiment.runs)}
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Close"
          onClick={onClose}
        >
          <X className="size-4" />
        </Button>
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-4">
        <RunCreationWizard experiment={experiment} onClose={onClose} />
      </div>
    </div>
  );
}
