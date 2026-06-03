import { getTaskTemplate } from "@/domain/task-template/catalog";
import {
  formatParamValue,
  getPlanningParamFieldsForDisplay,
  paramFieldHasValue,
} from "@/domain/task-template/param-schema";
import type { Task } from "@/domain/task/types";
import { cn } from "@adaptyv-coordination/ui/lib/utils";

type ParameterSummaryProps = {
  task: Task;
  showHeading?: boolean;
  /** Flat layout for dialogs — no nested card chrome. */
  variant?: "card" | "flat";
};

export function ParameterSummary({
  task,
  showHeading = true,
  variant = "card",
}: ParameterSummaryProps) {
  const template = getTaskTemplate(task.taskTemplateId);
  if (!template) {
    return <p className="text-sm text-muted-foreground">No run settings</p>;
  }

  const fields = getPlanningParamFieldsForDisplay(template.paramSchema, task.params).sort(
    (a, b) => {
      const aHas = paramFieldHasValue(task.params[a.name]) ? 1 : 0;
      const bHas = paramFieldHasValue(task.params[b.name]) ? 1 : 0;
      return bHas - aHas;
    },
  );

  if (fields.length === 0) {
    return <p className="text-sm text-muted-foreground">No run settings</p>;
  }

  const isFlat = variant === "flat";

  return (
    <div
      className={cn(
        !isFlat && "rounded-lg border border-border/60 bg-background/80",
        isFlat ? "" : showHeading ? "p-3" : "p-2.5",
      )}
    >
      {showHeading ? (
        <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-foreground">
          Run settings
        </p>
      ) : null}
      <dl className="grid gap-x-4 gap-y-2.5 sm:grid-cols-2">
        {fields.map((field) => (
          <div key={field.name} className="min-w-0">
            <dt className="text-xs text-muted-foreground">
              {field.title ?? field.name}
              {field.unit ? ` (${field.unit})` : ""}
            </dt>
            <dd className="text-sm font-semibold tabular-nums text-foreground">
              {formatParamValue(task.params[field.name])}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
