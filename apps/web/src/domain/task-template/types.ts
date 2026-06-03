export type ParamFieldType =
  | "string"
  | "number"
  | "select"
  | "boolean"
  | "array"
  | "file";

export type ParamField = {
  name: string;
  type: ParamFieldType;
  required: boolean;
  unit?: string;
  default?: unknown;
  options?: string[];
  title?: string;
  description?: string;
  itemFields?: ParamField[];
};

export type ParamSchema = {
  title?: string;
  fields: ParamField[];
};

export type ResourceScaling = "PER_TASK" | "PER_WORK_PACKAGE" | "STEPPED";

export type ResourceRequirement = {
  resourceType: string;
  scaling: ResourceScaling;
  amount: number;
  stepSize?: number;
};

export type ResourceProfile = ResourceRequirement[];

export type TaskStage = "prep" | "run" | "analysis";

export type TaskTemplateBase = {
  id: string;
  name: string;
  durationMinutes: number;
  plateTypeId?: string;
  machineTypeId?: string;
  paramSchema: ParamSchema;
};

export type TaskTemplate = TaskTemplateBase & {
  impactWeight: number;
  stage: TaskStage;
  batchKeyFields: string[];
  resourceProfile: ResourceProfile;
  /** Plate types technicians must load as inputs (upstream material). */
  requiredPlateTypes?: string[];
};
