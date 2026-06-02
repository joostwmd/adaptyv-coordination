import { seedExperiments, seedStaff } from "@/data/seedData";
import {
  createRerunTasks,
  createStandaloneTask,
  refreshAllTaskReadiness,
  scaffoldTasks,
} from "@/domain/task";
import { resetTaskIdCounter } from "@/domain/task/scaffold";
import type { Task } from "@/domain/task/types";
import type { Ticket } from "@/domain/ticket/types";
import {
  createWorkUnitFromTasks,
  groupIntoDraftWorkUnits,
  resetWorkUnitIdCounter,
} from "@/domain/work-unit";
import type { WorkUnit } from "@/domain/work-unit/types";
import { getWorkflowTemplate } from "@/domain/workflow";
import type { ExperimentDetail } from "@/types";

export type PlanningSeedData = {
  tasks: Task[];
  workUnits: WorkUnit[];
  tickets: Ticket[];
};

const BUFFER_PREP_TEMPLATE = "01944581-afc2-2a97-3ba6-14b9cbc54691";
const EXPR_RUN_TEMPLATE = "3e7749a4-d7b7-44a8-b1f3-e2e61dbba64c";
const BLI_RUN_TEMPLATE = "1fa2fc3f-adc6-46df-96cb-cafc71f7e7c9";

const SCHEDULE_DAYS = [
  "2026-06-02",
  "2026-06-03",
  "2026-06-04",
  "2026-06-05",
  "2026-06-06",
  "2026-06-09",
  "2026-06-10",
  "2026-06-11",
];

let ticketIdCounter = 0;

function resetTicketIdCounter(seed = 0): void {
  ticketIdCounter = seed;
}

function nextTicketId(): string {
  ticketIdCounter += 1;
  return `ticket-${ticketIdCounter}`;
}

function toSummary(experiment: ExperimentDetail) {
  const { runs: _runs, ...summary } = experiment;
  return summary;
}

function daysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

function scaffoldAllExperiments(): Task[] {
  const tasks: Task[] = [];

  for (const experiment of seedExperiments) {
    const workflow =
      getWorkflowTemplate(experiment.type, experiment.methodName) ??
      getWorkflowTemplate(experiment.type);
    if (!workflow) continue;

    const scaffolded = scaffoldTasks(toSummary(experiment), workflow);
    scaffolded.forEach((task, stepIndex) => {
      tasks.push({
        ...task,
        createdAt: daysAgo(21 - stepIndex),
      });
    });
  }

  return tasks;
}

function addStandaloneTasks(tasks: Task[]): Task[] {
  const standalones = [
    createStandaloneTask(BUFFER_PREP_TEMPLATE, {
      buffer_k: 2,
      buffer_be: 1,
      buffer_r: 0.5,
    }),
    createStandaloneTask(BUFFER_PREP_TEMPLATE, {
      buffer_k: 5,
      buffer_be: 2,
      buffer_r: 1,
    }),
    createStandaloneTask(BUFFER_PREP_TEMPLATE, {
      buffer_k: 1.5,
      buffer_be: 0.5,
      buffer_r: 0.25,
    }),
    createStandaloneTask(BUFFER_PREP_TEMPLATE, { buffer_k: 3, buffer_r: 0.75 }),
  ].map((task, index) => ({
    ...task,
    createdAt: daysAgo(3 + index),
  }));

  return [...tasks, ...standalones];
}

function applyPlanningScenarios(tasks: Task[]): Task[] {
  let result = [...tasks];

  const byExperiment = (experimentId: string) =>
    result.filter((t) => t.experimentIds.includes(experimentId));

  const bindingFirst = byExperiment("exp-binding-1")[0];
  if (bindingFirst) {
    result = result.map((t) =>
      t.id === bindingFirst.id
        ? { ...t, blockedReason: "missing_materials" as const }
        : t,
    );
  }

  const medcoreTasks = byExperiment("exp-medcore-screen");
  const medcoreExprRuns = medcoreTasks.filter((t) => t.taskTemplateId === EXPR_RUN_TEMPLATE);
  if (medcoreExprRuns.length >= 2) {
    const inLabosIds = new Set(medcoreExprRuns.slice(0, 2).map((t) => t.id));
    result = result.map((t) =>
      inLabosIds.has(t.id) ? { ...t, readiness: "in_labos" as const } : t,
    );
  }

  const productionTasks = byExperiment("exp-production-1");
  if (productionTasks[0]) {
    result = result.map((t) =>
      t.id === productionTasks[0]!.id
        ? { ...t, readiness: "in_labos" as const }
        : t,
    );
  }

  const acmeTasks = byExperiment("exp-acme-expression");
  const acmeRerunSource =
    acmeTasks.find((t) => t.taskTemplateId === EXPR_RUN_TEMPLATE) ??
    acmeTasks.find((t) => t.dependsOn.length > 0);
  if (acmeRerunSource) {
    result.push(
      ...createRerunTasks([acmeRerunSource]).map((t) => ({
        ...t,
        createdAt: daysAgo(2),
      })),
    );
  }

  const medcoreBli = medcoreTasks.find((t) => t.taskTemplateId === BLI_RUN_TEMPLATE);
  if (medcoreBli) {
    result.push(
      ...createRerunTasks([medcoreBli]).map((t) => ({
        ...t,
        createdAt: daysAgo(1),
      })),
    );
  }

  const tnqTasks = byExperiment("100a7e4a-8521-5ce9-b22c-7c4f88922623");
  const tnqLate = tnqTasks.at(-1);
  if (tnqLate && tnqLate.readiness !== "in_labos") {
    result = result.map((t) =>
      t.id === tnqLate.id ? { ...t, blockedReason: "awaiting_client" as const } : t,
    );
  }

  return refreshAllTaskReadiness(result);
}

function buildTicketsForWorkUnits(workUnits: WorkUnit[]): Ticket[] {
  const scheduledCount = Math.max(1, Math.floor(workUnits.length * 0.65));
  const tickets: Ticket[] = [];

  for (let index = 0; index < scheduledCount; index++) {
    const workUnit = workUnits[index];
    if (!workUnit) break;

    tickets.push({
      id: nextTicketId(),
      workUnitId: workUnit.id,
      assigneeId: seedStaff[index % seedStaff.length]!.id,
      scheduledDay: SCHEDULE_DAYS[index % SCHEDULE_DAYS.length]!,
      status: "scheduled",
    });
  }

  return tickets;
}

function attachTasksToWorkUnits(tasks: Task[], workUnits: WorkUnit[]): Task[] {
  const workUnitByTask = new Map<string, string>();
  for (const workUnit of workUnits) {
    for (const taskId of workUnit.taskIds) {
      workUnitByTask.set(taskId, workUnit.id);
    }
  }

  return refreshAllTaskReadiness(
    tasks.map((t) => {
      const workUnitId = workUnitByTask.get(t.id);
      if (workUnitId) {
        return { ...t, workUnitId, readiness: "batched" as const };
      }
      return t;
    }),
  );
}

export function buildPlanningSeedData(): PlanningSeedData {
  resetTaskIdCounter(1000);
  resetWorkUnitIdCounter(2000);
  resetTicketIdCounter(3000);

  let tasks = scaffoldAllExperiments();
  tasks = addStandaloneTasks(tasks);
  tasks = applyPlanningScenarios(tasks);

  const ready = tasks.filter((t) => t.readiness === "ready");
  const draftWorkUnits = groupIntoDraftWorkUnits(ready);

  const exprRunReady = ready.filter((t) => t.taskTemplateId === EXPR_RUN_TEMPLATE);
  if (exprRunReady.length >= 4) {
    const exprGroup = draftWorkUnits.find(
      (wu) => wu.taskTemplateId === EXPR_RUN_TEMPLATE,
    );
    if (exprGroup) {
      exprGroup.taskIds = exprRunReady.slice(0, 4).map((t) => t.id);
    }
  }

  const workUnitsToUse = draftWorkUnits.filter((wu) => wu.taskIds.length > 0);
  const keepUnbatchedRatio = 0.2;
  const splitIndex = Math.max(
    1,
    Math.floor(workUnitsToUse.length * (1 - keepUnbatchedRatio)),
  );
  const batchedWorkUnits = workUnitsToUse.slice(0, splitIndex);

  const overflowExpr = exprRunReady.slice(4, 6);
  if (overflowExpr.length >= 2) {
    batchedWorkUnits.push(createWorkUnitFromTasks(overflowExpr));
  }

  const workUnits: WorkUnit[] = batchedWorkUnits.map((wu) => ({
    ...wu,
    status: "draft" as const,
  }));

  const tickets = buildTicketsForWorkUnits(workUnits);
  tasks = attachTasksToWorkUnits(tasks, workUnits);

  return { tasks, workUnits, tickets };
}

export function validatePlanningSeed(data: PlanningSeedData): boolean {
  return data.tasks.length > 0 && data.workUnits.length > 0;
}
