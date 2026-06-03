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

export type ExperimentStatus = 
  | "synced"        // Data pulled from lab system
  | "configured";   // Has at least one run with tasks

export type ExperimentRunStatus = 
  | "draft"         // Run created but tasks not started
  | "ready"         // All tasks configured and ready
  | "in_progress"   // Some tasks started
  | "completed"     // All tasks completed successfully  
  | "failed"        // One or more tasks failed
  | "cancelled";    // Run was cancelled

/** Client SLA tier for planning priority (1 = lowest, 5 = highest). */
export type ClientRef = {
  id: string;
  name: string;
  tier: number;
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
  /** ISO date (YYYY-MM-DD) for ETA / deadline proximity scoring. */
  dueDate?: string;
  client: ClientRef;
  status: ExperimentStatus;
  runs: ExperimentRunSummary[];
};

/** Experiment metadata without the runs collection (use ExperimentDetail for runs). */
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
  | "dueDate"
  | "client"
  | "status"
>;

export type ExperimentRunSummary = {
  id: string;
  name: string;
  revisionIndex: number;
  experimentId: string;
  status: ExperimentRunStatus;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  taskCount: number;
  completedTaskCount: number;
  failedTaskCount: number;
};

export type ExperimentDetail = ExperimentSummary & {
  runs: ExperimentRunSummary[];
};

/** Keep run taskCount fields in sync with tasks via deriveRunTaskStats from @/types/task. */

export type ExperimentRunDetail = ExperimentRunSummary & {
  experiment: ExperimentSummary;
};
