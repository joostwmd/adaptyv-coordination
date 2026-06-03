import type { ExperimentType } from "@/types";

import { WORKFLOW_PRESETS_GENERATED } from "./presets.generated";
import type { WorkflowTemplate } from "./types";

export const WORKFLOW_PRESETS: WorkflowTemplate[] = WORKFLOW_PRESETS_GENERATED;

export function getWorkflowTemplate(
  experimentType: ExperimentType,
  methodName?: string,
): WorkflowTemplate | undefined {
  const exact = WORKFLOW_PRESETS.find(
    (w) =>
      w.experimentType === experimentType &&
      (methodName ? w.methodName === methodName : !w.methodName),
  );
  if (exact) return exact;

  return WORKFLOW_PRESETS.find(
    (w) => w.experimentType === experimentType && w.id.endsWith("-default"),
  );
}
