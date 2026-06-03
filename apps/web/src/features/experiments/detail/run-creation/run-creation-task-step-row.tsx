import { Checkbox } from "@adaptyv-coordination/ui/components/checkbox";
import { Badge } from "@adaptyv-coordination/ui/components/badge";
import { cn } from "@adaptyv-coordination/ui/lib/utils";

import type { SelectableRunStep } from "@/domain/run-creation/types";

type RunCreationTaskStepRowProps = {
  step: SelectableRunStep;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  stepNumber: number;
};

export function RunCreationTaskStepRow({
  step,
  checked,
  onCheckedChange,
  stepNumber,
}: RunCreationTaskStepRowProps) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-2 px-2 py-1.5 transition-colors",
        "hover:bg-muted/40",
        checked && "bg-primary/[0.04]",
      )}
    >
      <Checkbox
        checked={checked}
        onCheckedChange={(value) => onCheckedChange(value === true)}
        aria-label={`Include ${step.templateName}`}
      />
      <span className="w-5 shrink-0 text-right text-[11px] tabular-nums text-muted-foreground">
        {stepNumber}.
      </span>
      <span className="min-w-0 flex-1 truncate text-sm text-foreground">
        {step.templateName}
      </span>
      {step.optional ? (
        <Badge
          variant="outline"
          className="h-5 shrink-0 px-1.5 text-[10px] font-normal"
        >
          Opt.
        </Badge>
      ) : null}
      {step.durationMinutes > 0 ? (
        <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
          {step.durationMinutes}m
        </span>
      ) : null}
    </label>
  );
}
