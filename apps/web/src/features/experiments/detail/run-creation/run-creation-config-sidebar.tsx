import { cn } from "@adaptyv-coordination/ui/lib/utils";
import { Check, Circle } from "lucide-react";

import type { TaskConfigStatus } from "@/domain/run-creation/validation";
import type { SelectableRunStep } from "@/domain/run-creation/types";

type RunCreationConfigSidebarProps = {
  steps: SelectableRunStep[];
  activeStepKey: string;
  statuses: Record<string, TaskConfigStatus>;
  onSelectStep: (stepKey: string) => void;
};

export function RunCreationConfigSidebar({
  steps,
  activeStepKey,
  statuses,
  onSelectStep,
}: RunCreationConfigSidebarProps) {
  return (
    <nav
      className="flex h-full min-h-0 w-44 shrink-0 flex-col border-r border-border/60"
      aria-label="Configure steps"
    >
      <p className="shrink-0 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        Steps
      </p>
      <ul className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-1.5 pb-2">
        {steps.map((step, index) => {
          const isActive = step.key === activeStepKey;
          const status = statuses[step.key] ?? "incomplete";
          const isComplete = status === "complete";

          return (
            <li key={step.key}>
              <button
                type="button"
                onClick={() => onSelectStep(step.key)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors",
                  "hover:bg-muted/50",
                  isActive && "bg-muted",
                )}
                aria-current={isActive ? "step" : undefined}
              >
                {isComplete ? (
                  <Check
                    className="size-3.5 shrink-0 text-primary"
                    aria-label="Complete"
                  />
                ) : (
                  <Circle
                    className="size-3.5 shrink-0 text-muted-foreground/70"
                    aria-label="Incomplete"
                  />
                )}
                <span className="w-4 shrink-0 text-[11px] tabular-nums text-muted-foreground">
                  {index + 1}
                </span>
                <span
                  className={cn(
                    "min-w-0 flex-1 truncate text-xs",
                    isActive ? "font-medium text-foreground" : "text-foreground/90",
                  )}
                >
                  {step.templateName}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
