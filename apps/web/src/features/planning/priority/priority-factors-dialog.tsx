import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@adaptyv-coordination/ui/components/dialog";
import { Button } from "@adaptyv-coordination/ui/components/button";
import { InfoIcon } from "lucide-react";

import { PRIORITY_DIMENSION_META } from "@/domain/priority/meta";

export function PriorityFactorsDialog() {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 shrink-0 gap-1 px-2 text-xs text-muted-foreground"
          />
        }
      >
        <InfoIcon className="size-3.5" />
        How scoring works
      </DialogTrigger>
      <DialogContent className="gap-0 sm:max-w-md">
        <DialogHeader className="space-y-1.5 pb-4">
          <DialogTitle className="text-base">How priority scoring works</DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">
            Each task gets a score from 0–1000. We multiply each factor (0–1) by its
            weight, add them up, then show the result on the badge. A work unit uses
            the score of its highest-scoring task.
          </DialogDescription>
        </DialogHeader>

        <ul className="flex max-h-[min(60vh,24rem)] flex-col gap-2 overflow-y-auto pr-1">
          {PRIORITY_DIMENSION_META.map((dimension) => (
            <li
              key={dimension.key}
              className="rounded-md border bg-muted/20 px-3 py-2.5"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium text-foreground">{dimension.label}</p>
                <code className="shrink-0 text-[10px] text-muted-foreground">
                  {dimension.factorHint}
                </code>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {dimension.description}
              </p>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
