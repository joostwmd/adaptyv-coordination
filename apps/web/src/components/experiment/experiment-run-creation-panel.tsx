import { X } from "lucide-react";

import { Button } from "@adaptyv-coordination/ui/components/button";

type ExperimentRunCreationPanelProps = {
  onClose: () => void;
};

export function ExperimentRunCreationPanel({
  onClose,
}: ExperimentRunCreationPanelProps) {
  return (
    <div className="flex h-full min-h-0 flex-col border-t bg-background">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b px-4 py-3">
        <div>
          <h2 className="text-sm font-medium">Create new run</h2>
          <p className="text-xs text-muted-foreground">
            Configure tasks from templates for this experiment run
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
      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        <p className="text-sm text-muted-foreground">
          Run creation flow will go here.
        </p>
      </div>
    </div>
  );
}
