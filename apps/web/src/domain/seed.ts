import { groupIntoDraftWorkUnits } from "@/domain/work-unit";
import { refreshAllTaskReadiness } from "@/domain/task";
import {
  createStandaloneTask,
  resetTaskIdCounter,
  scaffoldTasks,
} from "@/domain/task/scaffold";
import { resetWorkUnitIdCounter } from "@/domain/work-unit/grouping";
import { getWorkflowTemplate } from "@/domain/workflow";
import type { WorkUnit } from "@/domain/work-unit/types";
import type { Task } from "@/domain/task/types";
import type { ExperimentDetail, StaffMember } from "@/types";
import { seedExperiments, seedStaff } from "@/data/seedData";

export type PlanningSeedData = {
  tasks: Task[];
  workUnits: WorkUnit[];
};

function toSummary(experiment: ExperimentDetail) {
  const { runs: _runs, ...summary } = experiment;
  return summary;
}

export function buildPlanningSeedData(): PlanningSeedData {
  resetTaskIdCounter(1000);
  resetWorkUnitIdCounter(2000);

  const tasks: Task[] = [];

  const medcore = seedExperiments.find((e) => e.id === "exp-medcore-screen");
  const acme = seedExperiments.find((e) => e.id === "exp-acme-expression");
  const production = seedExperiments.find((e) => e.id === "exp-production-1");

  if (medcore) {
    const wf =
      getWorkflowTemplate(medcore.type, medcore.methodName) ??
      getWorkflowTemplate("binding_screening");
    if (wf) {
      tasks.push(...scaffoldTasks(toSummary(medcore), wf));
    }
  }

  if (acme) {
    const wf = getWorkflowTemplate(acme.type, acme.methodName);
    if (wf) {
      tasks.push(...scaffoldTasks(toSummary(acme), wf));
    }
  }

  if (production) {
    const wf = getWorkflowTemplate(production.type, production.methodName);
    if (wf) {
      tasks.push(...scaffoldTasks(toSummary(production), wf));
    }
  }

  tasks.push(
    createStandaloneTask("01944581-afc2-2a97-3ba6-14b9cbc54691", {
      buffer_k: 2,
      buffer_be: 1,
      buffer_r: 0.5,
    }),
  );

  let refreshed = refreshAllTaskReadiness(tasks);

  const readyForWorkUnit = refreshed.filter((t) => t.readiness === "ready");
  const draftWorkUnits = groupIntoDraftWorkUnits(readyForWorkUnit);

  const exprRunTasks = readyForWorkUnit.filter(
    (t) => t.taskTemplateId === "3e7749a4-d7b7-44a8-b1f3-e2e61dbba64c",
  );
  if (exprRunTasks.length >= 2) {
    const overflowWorkUnit = draftWorkUnits.find(
      (wu) => wu.taskTemplateId === "3e7749a4-d7b7-44a8-b1f3-e2e61dbba64c",
    );
    if (overflowWorkUnit) {
      overflowWorkUnit.taskIds = exprRunTasks.map((t) => t.id);
    }
  }

  refreshed = refreshed.map((t) => {
    const workUnit = draftWorkUnits.find((wu) => wu.taskIds.includes(t.id));
    if (workUnit) {
      return { ...t, workUnitId: workUnit.id, readiness: "batched" as const };
    }
    return t;
  });

  const workUnits: WorkUnit[] = draftWorkUnits.map((wu) => ({
    ...wu,
    assigneeIds: [seedStaff[0]!.id],
    scheduledDay: "2026-06-03",
    notes: [
      {
        id: "work-unit-note-1",
        author: seedStaff[0] as StaffMember,
        body: "Run expression batch before overnight BLI window.",
        createdAt: "2026-06-02T10:00:00.000Z",
      },
    ],
  }));

  return { tasks: refreshed, workUnits };
}

export function validatePlanningSeed(data: PlanningSeedData): boolean {
  return data.tasks.length > 0 && data.workUnits.length > 0;
}
