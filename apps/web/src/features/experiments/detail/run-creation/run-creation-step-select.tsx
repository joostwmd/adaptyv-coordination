import { Button } from "@adaptyv-coordination/ui/components/button";
import { cn } from "@adaptyv-coordination/ui/lib/utils";

import type { SelectableRunStep } from "@/domain/run-creation/types";

import { RunCreationTaskStepRow } from "./run-creation-task-step-row";

type RunCreationStepSelectProps = {
  workflowLabel: string;
  steps: SelectableRunStep[];
  selectedKeys: Set<string>;
  onSelectionChange: (keys: Set<string>) => void;
  className?: string;
};

export function RunCreationStepSelect({
  workflowLabel,
  steps,
  selectedKeys,
  onSelectionChange,
  className,
}: RunCreationStepSelectProps) {
  const allSelected = steps.length > 0 && steps.every((s) => selectedKeys.has(s.key));
  const someSelected = steps.some((s) => selectedKeys.has(s.key));
  const selectedCount = steps.filter((s) => selectedKeys.has(s.key)).length;

  const toggleAll = () => {
    if (allSelected) {
      onSelectionChange(new Set());
      return;
    }
    onSelectionChange(new Set(steps.map((s) => s.key)));
  };

  const toggleStep = (key: string, checked: boolean) => {
    const next = new Set(selectedKeys);
    if (checked) {
      next.add(key);
    } else {
      next.delete(key);
    }
    onSelectionChange(next);
  };

  if (steps.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No workflow template is configured for this experiment type.
      </p>
    );
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-center justify-between gap-2 text-xs">
        <p className="min-w-0 truncate text-muted-foreground">
          <span className="font-medium text-foreground">{workflowLabel}</span>
          <span className="mx-1.5 text-border">·</span>
          {selectedCount}/{steps.length} selected
        </p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 shrink-0 px-2 text-xs"
          onClick={toggleAll}
        >
          {allSelected ? "Deselect all" : "Select all"}
        </Button>
      </div>

      <ul
        className="divide-y divide-border/60 overflow-hidden rounded-md border border-border/60"
        role="list"
      >
        {steps.map((step, index) => (
          <li key={step.key}>
            <RunCreationTaskStepRow
              step={step}
              stepNumber={index + 1}
              checked={selectedKeys.has(step.key)}
              onCheckedChange={(checked) => toggleStep(step.key, checked)}
            />
          </li>
        ))}
      </ul>

      {!someSelected ? (
        <p className="text-xs text-amber-700 dark:text-amber-400" role="status">
          Select at least one step to continue.
        </p>
      ) : null}
    </div>
  );
}
