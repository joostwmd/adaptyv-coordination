import type { ExperimentRunSummary, ExperimentSummary } from "./experiment";
import type { StaffMember } from "./staff";

export type TaskStatus = 
  | "pending"       // Not started
  | "in_progress"   // Currently being executed
  | "completed"     // Successfully completed
  | "failed"        // Failed execution
  | "blocked"       // Waiting on dependencies
  | "cancelled";    // Manually cancelled

export type TaskNote = {
  id: string;
  author: StaffMember;
  body: string;
  createdAt: string;
};

export type Task = {
  id: string;
  title: string;
  status: TaskStatus;
  assignee: StaffMember;
  notes: TaskNote[];
  run: ExperimentRunSummary;
  experiment: ExperimentSummary;
};
