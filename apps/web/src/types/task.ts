import type { ExperimentRunSummary, ExperimentSummary } from "./experiment";
import type { StaffMember } from "./staff";

export type TaskStatus = "pending" | "success" | "failed";

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
