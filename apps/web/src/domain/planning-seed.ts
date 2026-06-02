import { seedExperiments, seedStaff } from "@/data/seedData";
import type { BlockedReason } from "@/domain/blocked-reason";
import {
  createRerunTasks,
  createStandaloneTask,
  refreshAllTaskReadiness,
  scaffoldTasks,
} from "@/domain/task";
import { nextTaskId, resetTaskIdCounter } from "@/domain/task/scaffold";
import type { Task } from "@/domain/task/types";
import type { Ticket } from "@/domain/ticket/types";
import {
  createWorkUnitFromTasks,
  resetWorkUnitIdCounter,
} from "@/domain/work-unit";
import type { WorkUnit } from "@/domain/work-unit/types";
import { getWorkflowTemplate, WORKFLOW_PRESETS } from "@/domain/workflow";
import type { WorkflowTemplate } from "@/domain/workflow/types";
import type { ExperimentDetail } from "@/types";

export type PlanningSeedData = {
  tasks: Task[];
  workUnits: WorkUnit[];
  tickets: Ticket[];
};

const T = {
  dnaRecon: "01909d1c-7da1-79aa-fe76-4c350d61a79c",
  exprPlatePrep: "a52e40c7-db76-46fe-bdc5-bf51522457c1",
  exprRun: "3e7749a4-d7b7-44a8-b1f3-e2e61dbba64c",
  bliRun: "1fa2fc3f-adc6-46df-96cb-cafc71f7e7c9",
  sprPrep: "01979c72-1e66-2a8e-555b-3cf5c9f56a06",
  thermoRun: "0196a064-9351-576b-9c4c-3b08f48f1f1e",
  review: "01909d1e-85a5-fc3a-97f0-5a0773cfe3c9",
  bufferPrep: "01944581-afc2-2a97-3ba6-14b9cbc54691",
} as const;

/** Shared batch key — sibling units + scheduled kanban demos. */
const EXPR_BATCH_A = {
  expression_temperature: 25,
  expression_time: 12,
  property_4: 200,
};

/** Distinct batch key — suggested pool group in queue. */
const EXPR_BATCH_POOL = {
  expression_temperature: 28,
  expression_time: 10,
  property_4: 180,
};

/** Distinct batch key — shows as a lone queue item. */
const EXPR_BATCH_B = {
  expression_temperature: 30,
  expression_time: 16,
  property_4: 220,
};

const BLI_BATCH = {
  probes_type: "Strep-Tactin XT",
};

/** Work unit indices from buildCuratedWorkUnits — only some are scheduled. */
const SCHEDULED_UNIT_INDICES = [4] as const;

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

function getExperiment(id: string): ExperimentDetail {
  const experiment = seedExperiments.find((entry) => entry.id === id);
  if (!experiment) {
    throw new Error(`Seed experiment not found: ${id}`);
  }
  return experiment;
}

const GENERIC_BINDING_WORKFLOW = WORKFLOW_PRESETS.find(
  (workflow) => workflow.id === "binding-screening-default",
);

function resolveWorkflow(experiment: ExperimentDetail): WorkflowTemplate | undefined {
  return (
    getWorkflowTemplate(experiment.type, experiment.methodName) ??
    getWorkflowTemplate(experiment.type) ??
    (experiment.type === "epitope_binning" ? GENERIC_BINDING_WORKFLOW : undefined)
  );
}

function workflowSteps(workflow: WorkflowTemplate) {
  return workflow.steps.filter((step) => !step.optional);
}

function scaffoldFirstStep(experiment: ExperimentDetail, createdDaysAgo = 12): Task[] {
  const workflow = resolveWorkflow(experiment);
  if (!workflow) return [];

  const firstStep = workflowSteps(workflow)[0];
  if (!firstStep) return [];

  return scaffoldTasks(toSummary(experiment), {
    ...workflow,
    steps: [firstStep],
  }).map((task) => ({
    ...task,
    createdAt: daysAgo(createdDaysAgo),
  }));
}

function scaffoldPendingSecondStep(
  experiment: ExperimentDetail,
  createdDaysAgo = 10,
): Task[] {
  const workflow = resolveWorkflow(experiment);
  if (!workflow) return [];

  const steps = workflowSteps(workflow).slice(0, 2);
  if (steps.length < 2) return scaffoldFirstStep(experiment, createdDaysAgo);

  return refreshAllTaskReadiness(
    scaffoldTasks(toSummary(experiment), {
      ...workflow,
      steps,
    }).map((task, index) => ({
      ...task,
      createdAt: daysAgo(createdDaysAgo - index),
    })),
  );
}

type ScaffoldThroughOptions = {
  createdDaysAgo?: number;
  paramOverrides?: Record<string, Record<string, unknown>>;
  blockedOn?: { templateId: string; reason: BlockedReason };
};

function scaffoldThroughStep(
  experiment: ExperimentDetail,
  throughTemplateId: string,
  options: ScaffoldThroughOptions = {},
): Task[] {
  const workflow = resolveWorkflow(experiment);
  if (!workflow) return [];

  const steps = workflowSteps(workflow);
  const throughIndex = steps.findIndex(
    (step) => step.taskTemplateId === throughTemplateId,
  );
  if (throughIndex === -1) return [];

  const includedSteps = steps.slice(0, throughIndex + 1);
  const includedIds = new Set(includedSteps.map((step) => step.taskTemplateId));

  const scaffolded = scaffoldTasks(toSummary(experiment), {
    ...workflow,
    steps: includedSteps,
  });

  const activeTemplateId = includedSteps.at(-1)?.taskTemplateId;
  const baseAge = options.createdDaysAgo ?? 14;

  let tasks = scaffolded
    .filter((task) => includedIds.has(task.taskTemplateId))
    .map((task, index) => ({
      ...task,
      createdAt: daysAgo(baseAge - index),
      params: {
        ...task.params,
        ...(options.paramOverrides?.[task.taskTemplateId] ?? {}),
      },
      readiness:
        task.taskTemplateId === activeTemplateId
          ? task.readiness
          : ("in_labos" as const),
    }));

  if (options.blockedOn) {
    tasks = tasks.map((task) =>
      task.taskTemplateId === options.blockedOn!.templateId
        ? {
            ...task,
            blockedReason: options.blockedOn!.reason,
            readiness: "blocked" as const,
          }
        : task,
    );
  }

  return refreshAllTaskReadiness(tasks);
}

function cloneReadyTask(
  source: Task,
  experiment: ExperimentDetail,
  createdDaysAgo: number,
  nameSuffix: string,
): Task {
  return {
    ...source,
    id: nextTaskId(),
    experimentIds: [experiment.id],
    name: `${nameSuffix} — ${experiment.code}`,
    dependsOn: [],
    readiness: "ready",
    workUnitId: undefined,
    blockedReason: undefined,
    createdAt: daysAgo(createdDaysAgo),
    params: { ...source.params },
  };
}

function buildScheduleDays(referenceDay: string): string[] {
  const base = new Date(`${referenceDay}T12:00:00`);
  const days: string[] = [];
  for (let offset = 0; offset < 8; offset += 1) {
    const date = new Date(base);
    date.setDate(date.getDate() + offset);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    days.push(`${year}-${month}-${day}`);
  }
  return days;
}

function attachTasksToWorkUnits(tasks: Task[], workUnits: WorkUnit[]): Task[] {
  const workUnitByTask = new Map<string, string>();
  for (const workUnit of workUnits) {
    for (const taskId of workUnit.taskIds) {
      workUnitByTask.set(taskId, workUnit.id);
    }
  }

  return refreshAllTaskReadiness(
    tasks.map((task) => {
      const workUnitId = workUnitByTask.get(task.id);
      if (workUnitId) {
        return { ...task, workUnitId, readiness: "batched" as const };
      }
      return task;
    }),
  );
}

function buildTickets(
  workUnits: WorkUnit[],
  scheduleDays: string[],
): Ticket[] {
  const labTechs = seedStaff.filter((member) => member.role === "lab-tech");
  const tickets: Ticket[] = [];

  SCHEDULED_UNIT_INDICES.forEach((unitIndex, ticketIndex) => {
    const workUnit = workUnits[unitIndex];
    if (!workUnit) return;

    tickets.push({
      id: nextTicketId(),
      workUnitId: workUnit.id,
      assigneeId: labTechs[ticketIndex % labTechs.length]!.id,
      scheduledDay: scheduleDays[ticketIndex]!,
      status: "scheduled",
    });
  });

  return tickets;
}

function buildCuratedTasks(): Task[] {
  let tasks: Task[] = [];

  // --- Queue: pool (3 ready expression runs, same batch key, no unit yet) ---
  const gentechPoolChain = scaffoldThroughStep(
    getExperiment("exp-gentech-expression"),
    T.exprRun,
    {
      createdDaysAgo: 8,
      paramOverrides: { [T.exprRun]: EXPR_BATCH_POOL },
    },
  );
  tasks.push(...gentechPoolChain);
  const gentechPoolTemplate = gentechPoolChain.find(
    (task) => task.taskTemplateId === T.exprRun,
  );
  if (gentechPoolTemplate) {
    tasks.push(
      cloneReadyTask(
        gentechPoolTemplate,
        getExperiment("exp-gentech-expression"),
        7,
        "Expression Run",
      ),
      cloneReadyTask(
        gentechPoolTemplate,
        getExperiment("exp-gentech-expression"),
        6,
        "Expression Run",
      ),
    );
  }

  // --- Queue: attach (1 BLI run in a unit, 2 more ready with matching key) ---
  const medcoreBliChain = scaffoldThroughStep(
    getExperiment("exp-medcore-screen"),
    T.bliRun,
    {
      createdDaysAgo: 10,
      paramOverrides: { [T.bliRun]: BLI_BATCH },
    },
  );
  tasks.push(...medcoreBliChain);
  const medcoreBliTemplate = medcoreBliChain.find(
    (task) => task.taskTemplateId === T.bliRun,
  );
  if (medcoreBliTemplate) {
    tasks.push(
      cloneReadyTask(
        medcoreBliTemplate,
        getExperiment("exp-medcore-screen"),
        4,
        "BLI Run",
      ),
      cloneReadyTask(
        medcoreBliTemplate,
        getExperiment("exp-medcore-screen"),
        3,
        "BLI Run",
      ),
    );
    tasks.push(
      ...createRerunTasks([medcoreBliTemplate]).map((task) => ({
        ...task,
        createdAt: daysAgo(1),
      })),
    );
  }

  // --- Queue: alone (distinct batch key + SPR prep) ---
  tasks.push(
    ...scaffoldThroughStep(getExperiment("exp-fredy-expression"), T.exprRun, {
      createdDaysAgo: 5,
      paramOverrides: { [T.exprRun]: EXPR_BATCH_B },
    }),
  );
  tasks.push(
    ...scaffoldThroughStep(getExperiment("exp-medcore-affinity"), T.sprPrep, {
      createdDaysAgo: 9,
    }),
  );

  // --- Units: sibling set (two units, same batch key) ---
  const acmeExprChain = scaffoldThroughStep(
    getExperiment("exp-acme-expression"),
    T.exprRun,
    {
      createdDaysAgo: 11,
      paramOverrides: { [T.exprRun]: EXPR_BATCH_A },
    },
  );
  tasks.push(...acmeExprChain);
  const acmeExprTemplate = acmeExprChain.find(
    (task) => task.taskTemplateId === T.exprRun,
  );
  if (acmeExprTemplate) {
    tasks.push(
      cloneReadyTask(
        acmeExprTemplate,
        getExperiment("exp-acme-expression"),
        5,
        "Expression Run",
      ),
      cloneReadyTask(
        acmeExprTemplate,
        getExperiment("exp-acme-expression"),
        4,
        "Expression Run",
      ),
      cloneReadyTask(
        acmeExprTemplate,
        getExperiment("exp-acme-expression"),
        3,
        "Expression Run",
      ),
    );
    tasks.push(
      ...createRerunTasks([acmeExprTemplate]).map((task) => ({
        ...task,
        createdAt: daysAgo(2),
      })),
    );
  }

  // --- Units: overflow split (5 plate preps exceed plate well capacity) ---
  const thermoOverflowChain = scaffoldThroughStep(
    getExperiment("exp-fredy-thermo"),
    T.exprPlatePrep,
    {
      createdDaysAgo: 6,
    },
  );
  tasks.push(...thermoOverflowChain);
  const thermoPrepTemplate = thermoOverflowChain.find(
    (task) => task.taskTemplateId === T.exprPlatePrep,
  );
  if (thermoPrepTemplate) {
    tasks.push(
      cloneReadyTask(
        thermoPrepTemplate,
        getExperiment("exp-fredy-thermo"),
        5,
        "Expression Plate Prep",
      ),
      cloneReadyTask(
        thermoPrepTemplate,
        getExperiment("exp-fredy-thermo"),
        4,
        "Expression Plate Prep",
      ),
      cloneReadyTask(
        thermoPrepTemplate,
        getExperiment("exp-fredy-thermo"),
        3,
        "Expression Plate Prep",
      ),
      cloneReadyTask(
        thermoPrepTemplate,
        getExperiment("exp-fredy-thermo"),
        2,
        "Expression Plate Prep",
      ),
    );
  }

  // --- Kanban: production thermo run (urgent, scheduled today) ---
  tasks.push(
    ...scaffoldThroughStep(getExperiment("exp-production-1"), T.thermoRun, {
      createdDaysAgo: 4,
    }),
  );

  // --- Blocked (varied reasons) ---
  tasks.push(
    ...scaffoldFirstStep(getExperiment("exp-binding-1"), 15).map((task) => ({
      ...task,
      blockedReason: "missing_materials" as const,
    })),
    ...scaffoldFirstStep(getExperiment("exp-acme-binding"), 14).map((task) => ({
      ...task,
      blockedReason: "missing_materials" as const,
    })),
    ...scaffoldFirstStep(getExperiment("exp-biopharma-binding"), 13).map((task) => ({
      ...task,
      blockedReason: "awaiting_client" as const,
    })),
    ...scaffoldThroughStep(
      getExperiment("100a7e4a-8521-5ce9-b22c-7c4f88922623"),
      T.review,
      {
        createdDaysAgo: 16,
        blockedOn: { templateId: T.review, reason: "awaiting_client" },
      },
    ),
  );

  // --- Waiting upstream (step 2 blocked by incomplete step 1) ---
  tasks.push(
    ...scaffoldPendingSecondStep(getExperiment("exp-biopharma-epitope"), 11),
    ...scaffoldPendingSecondStep(getExperiment("exp-gentech-stability"), 10),
  );

  // --- Standalone buffer prep (two lone items with different batch keys) ---
  tasks.push(
    createStandaloneTask(T.bufferPrep, {
      buffer_k: 2,
      buffer_be: 1,
      buffer_r: 0.5,
    }),
    createStandaloneTask(T.bufferPrep, {
      buffer_k: 5,
      buffer_be: 2,
      buffer_r: 1,
    }),
  );

  tasks = tasks.map((task, index) => ({
    ...task,
    createdAt: task.createdAt ?? daysAgo(7 + index),
  }));

  return refreshAllTaskReadiness(tasks);
}

function buildCuratedWorkUnits(tasks: Task[]): WorkUnit[] {
  const readyExprA = tasks.filter(
    (task) =>
      task.readiness === "ready" &&
      !task.workUnitId &&
      task.taskTemplateId === T.exprRun &&
      task.params.expression_temperature === EXPR_BATCH_A.expression_temperature &&
      task.params.expression_time === EXPR_BATCH_A.expression_time,
  );

  const acmeExprRuns = readyExprA.filter((task) =>
    task.experimentIds.includes("exp-acme-expression"),
  );
  const thermoOverflowRuns = tasks.filter(
    (task) =>
      task.readiness === "ready" &&
      !task.workUnitId &&
      task.taskTemplateId === T.exprPlatePrep &&
      task.experimentIds.includes("exp-fredy-thermo"),
  );

  const medcoreBliRuns = tasks.filter(
    (task) =>
      task.readiness === "ready" &&
      !task.workUnitId &&
      task.taskTemplateId === T.bliRun &&
      task.experimentIds.includes("exp-medcore-screen"),
  );

  const productionThermo = tasks.find(
    (task) =>
      task.readiness === "ready" &&
      task.taskTemplateId === T.thermoRun &&
      task.experimentIds.includes("exp-production-1"),
  );

  const workUnits: WorkUnit[] = [];

  // Index 0–1: sibling set (first one gets scheduled on kanban)
  if (acmeExprRuns.length >= 4) {
    workUnits.push(createWorkUnitFromTasks(acmeExprRuns.slice(0, 2)));
    workUnits.push(createWorkUnitFromTasks(acmeExprRuns.slice(2, 4)));
  }

  // Index 2: overflow split demo
  if (thermoOverflowRuns.length >= 5) {
    workUnits.push(createWorkUnitFromTasks(thermoOverflowRuns.slice(0, 5)));
  }

  // Index 3: attach target unit
  if (medcoreBliRuns.length >= 1) {
    workUnits.push(createWorkUnitFromTasks([medcoreBliRuns[0]!]));
  }

  // Index 4: production thermo (scheduled today)
  if (productionThermo) {
    workUnits.push(createWorkUnitFromTasks([productionThermo]));
  }

  return workUnits.map((workUnit) => ({ ...workUnit, status: "draft" as const }));
}

export function buildPlanningSeedData(): PlanningSeedData {
  resetTaskIdCounter(1000);
  resetWorkUnitIdCounter(2000);
  resetTicketIdCounter(3000);

  const referenceDay = new Date().toISOString().slice(0, 10);
  const scheduleDays = buildScheduleDays(referenceDay);

  let tasks = buildCuratedTasks();
  const workUnits = buildCuratedWorkUnits(tasks);
  const tickets = buildTickets(workUnits, scheduleDays);
  tasks = attachTasksToWorkUnits(tasks, workUnits);

  return { tasks, workUnits, tickets };
}

export function validatePlanningSeed(data: PlanningSeedData): boolean {
  return data.tasks.length > 0 && data.workUnits.length > 0;
}
