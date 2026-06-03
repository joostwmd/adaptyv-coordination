import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@adaptyv-coordination/ui/components/dialog";
import { Link } from "@tanstack/react-router";

import type { ExperimentSummary } from "@/types";

import { ExperimentContent } from "./experiment-content";

type ExperimentDetailDialogProps = {
  experiment: ExperimentSummary | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ExperimentDetailDialog({
  experiment,
  open,
  onOpenChange,
}: ExperimentDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {experiment ? (
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="sr-only">{experiment.name}</DialogTitle>
          </DialogHeader>
          <ExperimentContent experiment={experiment} />
          <p className="border-t border-border/50 pt-3 text-xs">
            <Link
              to="/experiments/$experimentId"
              params={{ experimentId: experiment.id }}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Open full experiment view
            </Link>
          </p>
        </DialogContent>
      ) : null}
    </Dialog>
  );
}
