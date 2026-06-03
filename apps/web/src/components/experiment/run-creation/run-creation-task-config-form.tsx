import { getPlateType } from "@/domain/plate/catalog";
import { getTaskTemplate } from "@/domain/task-template/catalog";
import { getDisplayParamFields } from "@/domain/task-template/param-schema";
import type { RunTaskDraft } from "@/domain/run-creation/draft";
import type { SelectableRunStep } from "@/domain/run-creation/types";

import { PlateStockPicker } from "@/components/plate/plate-stock-picker";
import { RunCreationParamField } from "./run-creation-param-field";

type RunCreationTaskConfigFormProps = {
  step: SelectableRunStep;
  draft: RunTaskDraft;
  onDraftChange: (
    patch: Partial<Pick<RunTaskDraft, "params" | "plateAssignments">>,
  ) => void;
};

export function RunCreationTaskConfigForm({
  step,
  draft,
  onDraftChange,
}: RunCreationTaskConfigFormProps) {
  const template = getTaskTemplate(step.taskTemplateId);
  const paramFields = template ? getDisplayParamFields(template.paramSchema) : [];
  const requiredPlateTypes = template?.requiredPlateTypes ?? [];

  const updateParam = (name: string, value: unknown) => {
    onDraftChange({ params: { [name]: value } });
  };

  const updatePlate = (plateTypeId: string, stockId: string | undefined) => {
    onDraftChange({ plateAssignments: { [plateTypeId]: stockId } });
  };

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h3 className="text-sm font-semibold text-foreground">{step.templateName}</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Step {step.index + 1}
          {step.durationMinutes > 0 ? ` · ~${step.durationMinutes} min` : ""}
        </p>
      </header>

      {paramFields.length > 0 ? (
        <section className="flex flex-col gap-3">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-foreground">
            Run settings
          </h4>
          <div className="grid gap-3 sm:grid-cols-2">
            {paramFields.map((field) => (
              <RunCreationParamField
                key={field.name}
                field={field}
                value={draft.params[field.name]}
                onChange={(value) => updateParam(field.name, value)}
              />
            ))}
          </div>
        </section>
      ) : null}

      {requiredPlateTypes.length > 0 ? (
        <section className="flex flex-col gap-3">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-foreground">
            Required inputs
          </h4>
          <div className="flex flex-col gap-3">
            {requiredPlateTypes.map((plateTypeId) => {
              const plateType = getPlateType(plateTypeId);
              return (
                <div key={plateTypeId} className="grid gap-1.5">
                  <span className="text-xs text-muted-foreground">
                    {plateType?.name ?? "Plate"}
                    <span className="text-destructive" aria-hidden>
                      {" "}
                      *
                    </span>
                  </span>
                  <PlateStockPicker
                    plateTypeId={plateTypeId}
                    value={draft.plateAssignments[plateTypeId]}
                    onValueChange={(stockId) => updatePlate(plateTypeId, stockId)}
                  />
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {paramFields.length === 0 && requiredPlateTypes.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No parameters or plate inputs for this step.
        </p>
      ) : null}
    </div>
  );
}
