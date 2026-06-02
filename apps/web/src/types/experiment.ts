export type ExperimentType =
  | "affinity_characterization"
  | "binding_screening"
  | "epitope_binning"
  | "expression"
  | "thermostability";

export type ExperimentCategory = "rd" | "production";

export const EXPERIMENT_TYPE_LABEL: Record<ExperimentType, string> = {
  affinity_characterization: "Affinity Characterization",
  binding_screening: "Binding Screening",
  epitope_binning: "Epitope Binning",
  expression: "Expression",
  thermostability: "Thermostability",
};

export const EXPERIMENT_CATEGORY_LABEL: Record<ExperimentCategory, string> = {
  rd: "R&D",
  production: "Production",
};

const TYPE_LABEL_TO_ENUM: Record<string, ExperimentType> = {
  "Affinity Characterization": "affinity_characterization",
  "Binding Screening": "binding_screening",
  "Epitope Binning": "epitope_binning",
  Expression: "expression",
  Thermostability: "thermostability",
};

export function normalizeExperimentType(typeLabel: string): ExperimentType {
  return TYPE_LABEL_TO_ENUM[typeLabel] ?? "binding_screening";
}

export type ExperimentStatus = {
  name: string;
  color?: string;
};

export type ClientRef = {
  id: string;
  name: string;
};

export type ExperimentListItem = {
  id: string;
  code: string;
  name: string;
  priority: number;
  type: ExperimentType;
  typeLabel: string;
  methodName?: string;
  category: ExperimentCategory;
  client: ClientRef;
  status: ExperimentStatus;
};

export type ExperimentSummary = Pick<
  ExperimentListItem,
  | "id"
  | "code"
  | "name"
  | "priority"
  | "type"
  | "typeLabel"
  | "methodName"
  | "category"
  | "client"
  | "status"
>;

export type ExperimentRunSummary = {
  id: string;
  name: string;
  revisionIndex: number;
  experimentId: string;
};

export type ExperimentDetail = ExperimentSummary & {
  runs: ExperimentRunSummary[];
};

export type ExperimentRunDetail = ExperimentRunSummary & {
  experiment: ExperimentSummary;
};
