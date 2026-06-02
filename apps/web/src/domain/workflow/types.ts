import type { ExperimentType } from "@/types";

export type WorkflowStep = {
  taskTemplateId: string;
  optional?: boolean;
  paramOverrides?: Record<string, unknown>;
};

export type WorkflowTemplate = {
  id: string;
  experimentType: ExperimentType;
  methodName?: string;
  label: string;
  steps: WorkflowStep[];
};
