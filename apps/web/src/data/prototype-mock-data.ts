/**
 * Unified in-memory prototype mock data.
 * Scenario index: queue pool/attach/alone, sibling units, overflow split, multi-day kanban,
 * sent/done/failed tickets, all blocked reasons, reruns, plate gaps, experiment run statuses.
 */
import type { ContextItem } from "@/components/context/types";
import type { BlockedReason } from "@/domain/blocked-reason";
import {
  classifyReadyTasks,
  getUnscheduledWorkUnits,
} from "@/domain/planning/board-selectors";
import {
  createRerunTasks,
  createStandaloneTask,
  refreshAllTaskReadiness,
  scaffoldTasks,
} from "@/domain/task";
import { mockInputSampleCount } from "@/domain/task/input-samples";
import {
  nextTaskId,
  primaryRunForExperiment,
  resetTaskIdCounter,
} from "@/domain/task/scaffold";
import type { Ticket } from "@/domain/ticket/types";
import {
  createWorkUnitFromTasks,
  resetWorkUnitIdCounter,
} from "@/domain/work-unit";
import type { WorkUnit } from "@/domain/work-unit/types";
import { getWorkflowTemplate } from "@/domain/workflow";
import type { WorkflowTemplate } from "@/domain/workflow/types";
import type {
  ClientRef,
  ExperimentDetail,
  StaffMember,
  Task,
} from "@/types";
import { deriveRunTaskStats } from "@/types/task";

// --- Clients & staff ---
export const seedClients: ClientRef[] = [
  { id: "d4f8808e-f30f-542d-b533-d26b132034ae", name: "Fredy Therapeutics", tier: 5 },
  { id: "client-acme", name: "Acme Biologics", tier: 4 },
  { id: "client-biopharma", name: "BioPharma Solutions", tier: 3 },
  { id: "client-gentech", name: "GenTech Innovations", tier: 2 },
  { id: "client-medcore", name: "MedCore Research", tier: 2 },
];

// Seed staff - expanded from existing mock data
export const seedStaff: StaffMember[] = [
  { id: "staff-sarah", name: "Sarah Chen", role: "lab-tech" },
  { id: "staff-marcus", name: "Marcus Webb", role: "lab-tech" },
  { id: "staff-alice", name: "Alice Park", role: "lab-tech" },
  { id: "staff-james", name: "James Okonkwo", role: "lab-tech" },
  { id: "staff-nina", name: "Nina Patel", role: "lab-tech" },
  { id: "staff-tom", name: "Tom Becker", role: "lab-tech" },
  { id: "staff-yuki", name: "Yuki Tanaka", role: "lab-tech" },
  { id: "staff-elena", name: "Dr. Elena Rodriguez", role: "planner" },
  { id: "staff-david", name: "David Kumar", role: "planner" },
  { id: "staff-lisa", name: "Dr. Lisa Thompson", role: "planner" },
];

const TEMPLATE = {
  dnaRecon: "01909d1c-7da1-79aa-fe76-4c350d61a79c",
  exprPlatePrep: "a52e40c7-db76-46fe-bdc5-bf51522457c1",
  exprRun: "3e7749a4-d7b7-44a8-b1f3-e2e61dbba64c",
  bliRun: "1fa2fc3f-adc6-46df-96cb-cafc71f7e7c9",
  sprPrep: "01979c72-1e66-2a8e-555b-3cf5c9f56a06",
  sprRun: "01954733-5f3c-c54a-ac46-720de477e712",
  review: "01909d1e-85a5-fc3a-97f0-5a0773cfe3c9",
  thermoRun: "0196a064-9351-576b-9c4c-3b08f48f1f1e",
  targetRecon: "0195615e-c56d-603b-0b43-522cbdb52634",
  dataAnalysis: "01909d1e-1fdf-c8dc-ae7e-72ab364800b7",
  bufferPrep: "01944581-afc2-2a97-3ba6-14b9cbc54691",
  epitopePlatePrep: "45536063-fa83-45d4-a414-ea941402a52d",
} as const;

const EXPR_BATCH_A = {
  expression_temperature: 25,
  expression_time: 12,
  property_4: 200,
};

const EXPR_BATCH_POOL = {
  expression_temperature: 28,
  expression_time: 10,
  property_4: 180,
};

const EXPR_BATCH_B = {
  expression_temperature: 30,
  expression_time: 16,
  property_4: 220,
};

const BLI_BATCH = { probes_type: "Strep-Tactin XT" };

const EPITOPE_BATCH = { well_volume: 2, plates_count: 1 };

function seedTask(
  partial: Omit<Task, "dependsOn" | "createdAt" | "params" | "origin"> &
    Partial<
      Pick<
        Task,
        "dependsOn" | "createdAt" | "params" | "origin" | "requiredPlates" | "inputSampleCount"
      >
    >,
): Task {
  const inputSampleCount =
    partial.inputSampleCount ??
    mockInputSampleCount(partial.taskTemplateId, partial.id);

  return {
    params: {},
    dependsOn: [],
    origin: "template",
    createdAt: "2026-06-01T10:00:00.000Z",
    ...partial,
    requiredPlates:
      partial.requiredPlates && partial.requiredPlates.length > 0
        ? partial.requiredPlates
        : undefined,
    inputSampleCount,
  };
}

function applyRunStatsToExperiments(
  experiments: ExperimentDetail[],
  tasks: Task[],
): ExperimentDetail[] {
  return experiments.map((experiment) => ({
    ...experiment,
    runs: experiment.runs.map((run) => ({
      ...run,
      ...deriveRunTaskStats(run.id, tasks),
    })),
  }));
}

// Seed experiments - based on existing mock data with additional experiments
const seedExperimentsBase: ExperimentDetail[] = [
  {
    id: "100a7e4a-8521-5ce9-b22c-7c4f88922623",
    code: "TNQ-711-657",
    name: "Target Alpha Characterization",
    priority: 26074,
    type: "affinity_characterization",
    typeLabel: "Affinity Characterization",
    methodName: "SPR",
    category: "rd",
    dueDate: "2026-06-28",
    client: seedClients[0],
    status: "configured",
    runs: [
      {
        id: "run-tnq-baseline",
        name: "Baseline run",
        revisionIndex: 1,
        experimentId: "100a7e4a-8521-5ce9-b22c-7c4f88922623",
        status: "completed",
        createdAt: "2026-05-20T09:00:00.000Z",
        startedAt: "2026-05-20T10:00:00.000Z",
        completedAt: "2026-05-20T16:00:00.000Z",
        taskCount: 5,
        completedTaskCount: 5,
        failedTaskCount: 0,
      },
      {
        id: "run-tnq-rev2",
        name: "Revision 2 — buffer swap",
        revisionIndex: 2,
        experimentId: "100a7e4a-8521-5ce9-b22c-7c4f88922623",
        status: "in_progress",
        createdAt: "2026-05-28T09:00:00.000Z",
        startedAt: "2026-05-29T08:00:00.000Z",
        taskCount: 4,
        completedTaskCount: 2,
        failedTaskCount: 0,
      },
    ],
  },
  {
    id: "exp-production-1",
    code: "R3X-211-438",
    name: "Thermostability scale-up batch",
    priority: 12716993,
    type: "thermostability",
    typeLabel: "Thermostability",
    methodName: "BLI",
    category: "production",
    dueDate: "2026-06-04",
    client: seedClients[0],
    status: "configured",
    runs: [
      {
        id: "run-r3x-rev3",
        name: "Production revision 3",
        revisionIndex: 3,
        experimentId: "exp-production-1",
        status: "in_progress",
        createdAt: "2026-06-01T08:00:00.000Z",
        startedAt: "2026-06-01T09:00:00.000Z",
        taskCount: 8,
        completedTaskCount: 6,
        failedTaskCount: 0,
      },
    ],
  },
  {
    id: "exp-binding-1",
    code: "BSN-081-345",
    name: "Binding screen — antigen panel",
    priority: 1222056,
    type: "binding_screening",
    typeLabel: "Binding Screening",
    methodName: "DSF",
    category: "rd",
    dueDate: "2026-06-18",
    client: seedClients[0],
    status: "synced",
    runs: [
      {
        id: "run-bsn-rev1",
        name: "Initial binding panel",
        revisionIndex: 1,
        experimentId: "exp-binding-1",
        status: "draft",
        createdAt: "2026-05-25T14:00:00.000Z",
        taskCount: 0,
        completedTaskCount: 0,
        failedTaskCount: 0,
      },
    ],
  },
  {
    id: "exp-acme-expression",
    code: "ACM-455-122",
    name: "Protein Expression Optimization",
    priority: 890234,
    type: "expression",
    typeLabel: "Expression",
    methodName: "E. coli BL21",
    category: "rd",
    dueDate: "2026-07-05",
    client: seedClients[1],
    status: "configured",
    runs: [
      {
        id: "run-acm-pilot",
        name: "Pilot expression study",
        revisionIndex: 1,
        experimentId: "exp-acme-expression",
        status: "completed",
        createdAt: "2026-05-15T10:00:00.000Z",
        startedAt: "2026-05-16T08:00:00.000Z",
        completedAt: "2026-05-18T17:00:00.000Z",
        taskCount: 6,
        completedTaskCount: 6,
        failedTaskCount: 0,
      },
      {
        id: "run-acm-scale",
        name: "Scale-up validation",
        revisionIndex: 2,
        experimentId: "exp-acme-expression",
        status: "ready",
        createdAt: "2026-06-01T15:00:00.000Z",
        taskCount: 7,
        completedTaskCount: 0,
        failedTaskCount: 0,
      },
      {
        id: "run-acm-cancelled",
        name: "Abandoned scale attempt",
        revisionIndex: 3,
        experimentId: "exp-acme-expression",
        status: "cancelled",
        createdAt: "2026-05-20T12:00:00.000Z",
        startedAt: "2026-05-21T08:00:00.000Z",
        taskCount: 0,
        completedTaskCount: 0,
        failedTaskCount: 0,
      },
    ],
  },
  {
    id: "exp-biopharma-epitope",
    code: "BPS-340-789",
    name: "Epitope Mapping Study",
    priority: 567890,
    type: "epitope_binning",
    typeLabel: "Epitope Binning",
    methodName: "Competitive ELISA",
    category: "rd",
    dueDate: "2026-06-12",
    client: seedClients[2],
    status: "configured",
    runs: [
      {
        id: "run-bps-mapping",
        name: "Initial epitope mapping",
        revisionIndex: 1,
        experimentId: "exp-biopharma-epitope",
        status: "in_progress",
        createdAt: "2026-05-22T11:00:00.000Z",
        startedAt: "2026-05-23T09:00:00.000Z",
        taskCount: 4,
        completedTaskCount: 2,
        failedTaskCount: 0,
      },
    ],
  },
  {
    id: "exp-gentech-stability",
    code: "GTI-123-456",
    name: "Long-term Stability Assessment",
    priority: 234567,
    type: "thermostability",
    typeLabel: "Thermostability",
    methodName: "DSC/DLS",
    category: "production",
    dueDate: "2026-06-08",
    client: seedClients[3],
    status: "configured",
    runs: [
      {
        id: "run-gti-stability",
        name: "6-month stability study",
        revisionIndex: 1,
        experimentId: "exp-gentech-stability",
        status: "completed",
        createdAt: "2025-12-01T10:00:00.000Z",
        startedAt: "2025-12-02T08:00:00.000Z",
        completedAt: "2026-06-02T17:00:00.000Z",
        taskCount: 12,
        completedTaskCount: 12,
        failedTaskCount: 0,
      },
    ],
  },
  {
    id: "exp-medcore-screen",
    code: "MDC-678-901",
    name: "High-throughput Binding Screen",
    priority: 456789,
    type: "binding_screening",
    typeLabel: "Binding Screening",
    methodName: "BLI Array",
    category: "rd",
    dueDate: "2026-07-15",
    client: seedClients[4],
    status: "synced",
    runs: [
      {
        id: "run-mdc-hts",
        name: "HTS binding assay",
        revisionIndex: 1,
        experimentId: "exp-medcore-screen",
        status: "draft",
        createdAt: "2026-06-01T16:00:00.000Z",
        taskCount: 0,
        completedTaskCount: 0,
        failedTaskCount: 0,
      },
    ],
  },
  {
    id: "exp-fredy-expression",
    code: "FRD-902-114",
    name: "Pilot Expression — Candidate 7",
    priority: 412000,
    type: "expression",
    typeLabel: "Expression",
    methodName: "E. coli BL21",
    category: "rd",
    dueDate: "2026-06-22",
    client: seedClients[0],
    status: "configured",
    runs: [
      {
        id: "run-frd-pilot",
        name: "Pilot expression",
        revisionIndex: 1,
        experimentId: "exp-fredy-expression",
        status: "in_progress",
        createdAt: "2026-05-30T09:00:00.000Z",
        startedAt: "2026-05-31T08:00:00.000Z",
        taskCount: 5,
        completedTaskCount: 3,
        failedTaskCount: 0,
      },
    ],
  },
  {
    id: "exp-acme-binding",
    code: "ACM-881-203",
    name: "Secondary Binding Panel",
    priority: 1980000,
    type: "binding_screening",
    typeLabel: "Binding Screening",
    methodName: "DSF",
    category: "rd",
    dueDate: "2026-06-10",
    client: seedClients[1],
    status: "synced",
    runs: [
      {
        id: "run-acm-bind",
        name: "DSF binding panel",
        revisionIndex: 1,
        experimentId: "exp-acme-binding",
        status: "draft",
        createdAt: "2026-06-02T14:00:00.000Z",
        taskCount: 0,
        completedTaskCount: 0,
        failedTaskCount: 0,
      },
    ],
  },
  {
    id: "exp-medcore-affinity",
    code: "MDC-445-778",
    name: "Lead Molecule Affinity Titration",
    priority: 890000,
    type: "affinity_characterization",
    typeLabel: "Affinity Characterization",
    methodName: "SPR",
    category: "rd",
    dueDate: "2026-06-14",
    client: seedClients[4],
    status: "configured",
    runs: [
      {
        id: "run-mdc-spr",
        name: "SPR titration series",
        revisionIndex: 1,
        experimentId: "exp-medcore-affinity",
        status: "ready",
        createdAt: "2026-05-28T10:00:00.000Z",
        taskCount: 6,
        completedTaskCount: 0,
        failedTaskCount: 0,
      },
    ],
  },
  {
    id: "exp-biopharma-binding",
    code: "BPS-512-034",
    name: "Competitive Binding — Panel B",
    priority: 3200000,
    type: "binding_screening",
    typeLabel: "Binding Screening",
    methodName: "BLI",
    category: "rd",
    dueDate: "2026-06-07",
    client: seedClients[2],
    status: "configured",
    runs: [
      {
        id: "run-bps-bli",
        name: "BLI competitive panel",
        revisionIndex: 1,
        experimentId: "exp-biopharma-binding",
        status: "failed",
        createdAt: "2026-05-24T12:00:00.000Z",
        startedAt: "2026-05-25T08:00:00.000Z",
        taskCount: 4,
        completedTaskCount: 2,
        failedTaskCount: 2,
      },
    ],
  },
  {
    id: "exp-gentech-expression",
    code: "GTI-889-221",
    name: "Scale-up Expression Batch",
    priority: 156000,
    type: "expression",
    typeLabel: "Expression",
    category: "production",
    dueDate: "2026-06-05",
    client: seedClients[3],
    status: "configured",
    runs: [
      {
        id: "run-gti-expr",
        name: "Production expression",
        revisionIndex: 1,
        experimentId: "exp-gentech-expression",
        status: "in_progress",
        createdAt: "2026-06-02T08:00:00.000Z",
        startedAt: "2026-06-02T09:00:00.000Z",
        taskCount: 8,
        completedTaskCount: 5,
        failedTaskCount: 0,
      },
    ],
  },
  {
    id: "exp-fredy-thermo",
    code: "FRD-334-567",
    name: "Thermostability — Formulation A",
    priority: 7800000,
    type: "thermostability",
    typeLabel: "Thermostability",
    methodName: "BLI",
    category: "production",
    dueDate: "2026-06-03",
    client: seedClients[0],
    status: "configured",
    runs: [
      {
        id: "run-frd-thermo",
        name: "Thermo capillary run",
        revisionIndex: 1,
        experimentId: "exp-fredy-thermo",
        status: "completed",
        createdAt: "2026-05-28T13:00:00.000Z",
        startedAt: "2026-05-29T08:00:00.000Z",
        completedAt: "2026-06-02T15:00:00.000Z",
        taskCount: 6,
        completedTaskCount: 6,
        failedTaskCount: 0,
      },
    ],
  },
];

export const seedTasks: Task[] = [
  // TNQ baseline — completed SPR chain
  seedTask({
    id: "task-tnq-b1-spr-prep",
    taskTemplateId: TEMPLATE.sprPrep,
    name: "SPR Prep — TNQ baseline",
    experimentId: "100a7e4a-8521-5ce9-b22c-7c4f88922623",
    runId: "run-tnq-baseline",
    status: "completed",
    readiness: "in_labos",
    assignee: seedStaff[1],
    createdAt: "2026-05-20T09:30:00.000Z",
  }),
  seedTask({
    id: "task-tnq-b2-spr-run",
    taskTemplateId: TEMPLATE.sprRun,
    name: "SPR Run — TNQ baseline",
    experimentId: "100a7e4a-8521-5ce9-b22c-7c4f88922623",
    runId: "run-tnq-baseline",
    status: "completed",
    readiness: "in_labos",
    dependsOn: ["task-tnq-b1-spr-prep"],
    assignee: seedStaff[0],
    createdAt: "2026-05-20T11:00:00.000Z",
  }),
  seedTask({
    id: "task-tnq-b3-review",
    taskTemplateId: TEMPLATE.review,
    name: "Review — TNQ baseline",
    experimentId: "100a7e4a-8521-5ce9-b22c-7c4f88922623",
    runId: "run-tnq-baseline",
    status: "completed",
    readiness: "in_labos",
    dependsOn: ["task-tnq-b2-spr-run"],
    assignee: seedStaff[1],
    createdAt: "2026-05-20T15:00:00.000Z",
  }),
  // TNQ rev2 — in progress
  seedTask({
    id: "task-tnq-r1-spr-prep",
    taskTemplateId: TEMPLATE.sprPrep,
    name: "SPR Prep — buffer swap revision",
    experimentId: "100a7e4a-8521-5ce9-b22c-7c4f88922623",
    runId: "run-tnq-rev2",
    status: "completed",
    readiness: "in_labos",
    assignee: seedStaff[1],
    createdAt: "2026-05-29T08:00:00.000Z",
  }),
  seedTask({
    id: "task-tnq-r2-spr-run",
    taskTemplateId: TEMPLATE.sprRun,
    name: "SPR Run — buffer swap revision",
    experimentId: "100a7e4a-8521-5ce9-b22c-7c4f88922623",
    runId: "run-tnq-rev2",
    status: "in_progress",
    readiness: "ready",
    dependsOn: ["task-tnq-r1-spr-prep"],
    assignee: seedStaff[0],
    createdAt: "2026-05-30T09:00:00.000Z",
  }),
  // R3X production thermo
  seedTask({
    id: "task-r3x-thermo-run",
    taskTemplateId: TEMPLATE.thermoRun,
    name: "Thermostability Run — R3X",
    experimentId: "exp-production-1",
    runId: "run-r3x-rev3",
    status: "completed",
    readiness: "in_labos",
    assignee: seedStaff[2],
    createdAt: "2026-06-01T09:00:00.000Z",
  }),
  seedTask({
    id: "task-r3x-analysis",
    taskTemplateId: TEMPLATE.dataAnalysis,
    name: "Data Analysis — R3X",
    experimentId: "exp-production-1",
    runId: "run-r3x-rev3",
    status: "in_progress",
    readiness: "waiting_upstream",
    dependsOn: ["task-r3x-thermo-run"],
    assignee: seedStaff[2],
    createdAt: "2026-06-02T10:00:00.000Z",
  }),
  // Acme expression pilot
  seedTask({
    id: "task-acm-pilot-prep",
    taskTemplateId: TEMPLATE.exprPlatePrep,
    name: "Expression Plate Prep — pilot",
    experimentId: "exp-acme-expression",
    runId: "run-acm-pilot",
    status: "completed",
    readiness: "in_labos",
    assignee: seedStaff[4],
    createdAt: "2026-05-16T08:00:00.000Z",
  }),
  seedTask({
    id: "task-acm-pilot-run",
    taskTemplateId: TEMPLATE.exprRun,
    name: "Expression Run — pilot",
    experimentId: "exp-acme-expression",
    runId: "run-acm-pilot",
    status: "completed",
    readiness: "in_labos",
    dependsOn: ["task-acm-pilot-prep"],
    assignee: seedStaff[4],
    createdAt: "2026-05-17T08:00:00.000Z",
  }),
  // Acme scale-up
  seedTask({
    id: "task-acm-scale-run",
    taskTemplateId: TEMPLATE.exprRun,
    name: "Expression Run — scale-up",
    experimentId: "exp-acme-expression",
    runId: "run-acm-scale",
    status: "pending",
    readiness: "ready",
    assignee: seedStaff[5],
    createdAt: "2026-06-01T15:00:00.000Z",
  }),
  // BioPharma epitope
  seedTask({
    id: "task-bps-epitope-prep",
    taskTemplateId: TEMPLATE.targetRecon,
    name: "Target Prep — epitope mapping",
    experimentId: "exp-biopharma-epitope",
    runId: "run-bps-mapping",
    status: "completed",
    readiness: "in_labos",
    assignee: seedStaff[6],
    createdAt: "2026-05-23T09:00:00.000Z",
  }),
  seedTask({
    id: "task-bps-epitope-run",
    taskTemplateId: TEMPLATE.dnaRecon,
    name: "DNA Reconstitution — epitope follow-up",
    experimentId: "exp-biopharma-epitope",
    runId: "run-bps-mapping",
    status: "pending",
    readiness: "waiting_upstream",
    dependsOn: ["task-bps-epitope-prep"],
    assignee: seedStaff[6],
    createdAt: "2026-05-24T09:00:00.000Z",
  }),
  // GenTech stability report
  seedTask({
    id: "task-gti-stability-review",
    taskTemplateId: TEMPLATE.review,
    name: "Review — stability study",
    experimentId: "exp-gentech-stability",
    runId: "run-gti-stability",
    status: "completed",
    readiness: "in_labos",
    assignee: seedStaff[2],
    createdAt: "2026-06-01T12:00:00.000Z",
  }),
  // BioPharma binding failed
  seedTask({
    id: "task-bps-bind-prep",
    taskTemplateId: TEMPLATE.targetRecon,
    name: "Target Reconstitution — panel B",
    experimentId: "exp-biopharma-binding",
    runId: "run-bps-bli",
    status: "failed",
    readiness: "blocked",
    blockedReason: "missing_materials",
    assignee: seedStaff[3],
    createdAt: "2026-05-25T08:00:00.000Z",
  }),
  seedTask({
    id: "task-bps-bind-run",
    taskTemplateId: TEMPLATE.sprRun,
    name: "SPR Run — panel B (not started)",
    experimentId: "exp-biopharma-binding",
    runId: "run-bps-bli",
    status: "cancelled",
    readiness: "blocked",
    dependsOn: ["task-bps-bind-prep"],
    assignee: seedStaff[3],
    createdAt: "2026-05-26T08:00:00.000Z",
  }),
  // MedCore affinity SPR prep
  seedTask({
    id: "task-mdc-spr-prep",
    taskTemplateId: TEMPLATE.sprPrep,
    name: "SPR Prep — lead titration",
    experimentId: "exp-medcore-affinity",
    runId: "run-mdc-spr",
    status: "pending",
    readiness: "ready",
    assignee: seedStaff[1],
    createdAt: "2026-05-28T11:00:00.000Z",
  }),
  // Fredy thermo completed
  seedTask({
    id: "task-frd-thermo-run",
    taskTemplateId: TEMPLATE.thermoRun,
    name: "Thermostability Run — formulation A",
    experimentId: "exp-fredy-thermo",
    runId: "run-frd-thermo",
    status: "completed",
    readiness: "in_labos",
    assignee: seedStaff[0],
    createdAt: "2026-05-29T10:00:00.000Z",
  }),
  seedTask({
    id: "task-frd-thermo-review",
    taskTemplateId: TEMPLATE.review,
    name: "Review — formulation A",
    experimentId: "exp-fredy-thermo",
    runId: "run-frd-thermo",
    status: "completed",
    readiness: "in_labos",
    dependsOn: ["task-frd-thermo-run"],
    assignee: seedStaff[1],
    createdAt: "2026-06-02T14:00:00.000Z",
  }),
  // Fredy expression in progress
  seedTask({
    id: "task-frd-expr-prep",
    taskTemplateId: TEMPLATE.exprPlatePrep,
    name: "Expression Plate Prep — candidate 7",
    experimentId: "exp-fredy-expression",
    runId: "run-frd-pilot",
    status: "completed",
    readiness: "in_labos",
    assignee: seedStaff[0],
    createdAt: "2026-05-31T08:00:00.000Z",
  }),
  seedTask({
    id: "task-frd-expr-run",
    taskTemplateId: TEMPLATE.exprRun,
    name: "Expression Run — candidate 7",
    experimentId: "exp-fredy-expression",
    runId: "run-frd-pilot",
    status: "in_progress",
    readiness: "ready",
    dependsOn: ["task-frd-expr-prep"],
    assignee: seedStaff[2],
    createdAt: "2026-06-01T08:00:00.000Z",
  }),
  // Gentech expression production
  seedTask({
    id: "task-gti-expr-run",
    taskTemplateId: TEMPLATE.exprRun,
    name: "Expression Run — production batch",
    experimentId: "exp-gentech-expression",
    runId: "run-gti-expr",
    status: "in_progress",
    readiness: "ready",
    assignee: seedStaff[4],
    createdAt: "2026-06-02T10:00:00.000Z",
  }),
];

export const seedExperiments = applyRunStatsToExperiments(
  seedExperimentsBase,
  seedTasks,
);

export const seedContextItems: ContextItem[] = [
  {
    id: "ctx-platform-1",
    type: "platform",
    annotation: "Prior run used the same buffer conditions — compare yield before scaling up.",
    addedBy: "Sarah Chen",
    addedAt: "2026-05-28T14:30:00.000Z",
    recordType: "Experiment",
    title: "EXP-2024-0412 — Buffer optimization",
    outcome: "Yield 78%, within spec",
    href: "https://platform.adaptyv.example/experiments/exp-2024-0412",
    owner: "Sarah Chen",
    metrics: [
      { label: "Yield", value: "78%" },
      { label: "Purity", value: "96.2%" },
      { label: "Run time", value: "4.2 h" },
      { label: "Batch size", value: "2 L" },
    ],
  },
  {
    id: "ctx-client-slack-1",
    type: "client",
    channel: "slack",
    annotation: "Client confirmed they need results by June 15 for their internal review.",
    addedBy: "Marcus Webb",
    addedAt: "2026-05-30T09:15:00.000Z",
    clientName: "Acme Biologics",
    title: "#acme-rd-collab",
    excerpt:
      "Can we prioritize the thermal stability assay? Our team needs preliminary data before the board meeting next week.",
    href: "https://slack.com/archives/C01234567/p1717065600000",
    participants: "Alice Park (Acme), Marcus Webb, Sarah Chen",
    attachments: ["thermal_stability_brief.pdf"],
  },
  {
    id: "ctx-client-email-1",
    type: "client",
    channel: "email",
    annotation: "Formal sign-off on material specs referenced in the supplier sheet.",
    addedBy: "Marcus Webb",
    addedAt: "2026-05-29T16:45:00.000Z",
    clientName: "Acme Biologics",
    title: "Re: Material specification approval",
    excerpt:
      "We approve the updated peptide specification as attached. Please proceed with the next synthesis batch using lot PB-4421.",
    href: "mailto:alice@acmebio.example",
    from: "Alice Park <alice@acmebio.example>",
    to: "Marcus Webb <marcus@adaptyv.example>",
    attachments: ["spec_approval_v2.pdf"],
  },
  {
    id: "ctx-note-1",
    type: "note",
    annotation: "Hypothesis to test in this experiment — not yet validated.",
    addedBy: "Sarah Chen",
    addedAt: "2026-05-27T11:00:00.000Z",
    title: "Working hypothesis — pH sensitivity",
    bodyPreview:
      "We suspect the aggregation observed in run 3 is driven by pH drift during hold steps rather than temperature alone.",
    body: `We suspect the aggregation observed in run 3 is driven by pH drift during hold steps rather than temperature alone.

**Next steps**
- Monitor pH continuously during the 2 h hold at 25 °C
- Compare against run 1 (stable pH, no aggregation)
- If confirmed, adjust buffer capacity before scale-up

Open question: does the supplier lot variation affect buffer capacity? Cross-reference with PB-4421 CoA.`,
  },
  {
    id: "ctx-supplier-1",
    type: "supplier",
    annotation: "Reference CoA for the peptide lot used in this experiment.",
    addedBy: "Sarah Chen",
    addedAt: "2026-05-26T08:20:00.000Z",
    supplierName: "PeptideBio GmbH",
    materialName: "Custom peptide PB-4421",
    docType: "Certificate of Analysis",
    href: "https://supplier.example/docs/pb-4421-coa.pdf",
    specs: [
      { label: "Purity (HPLC)", value: "98.7%" },
      { label: "Identity (MS)", value: "Confirmed" },
      { label: "Water content", value: "< 5%" },
      { label: "Lot number", value: "PB-4421-A" },
      { label: "Expiry", value: "2027-03-15" },
    ],
  },
  {
    id: "ctx-paper-1",
    type: "paper",
    annotation: "Background on thermal aggregation mechanisms relevant to our hold-step protocol.",
    addedBy: "Marcus Webb",
    addedAt: "2026-05-25T13:10:00.000Z",
    title: "Thermal aggregation of therapeutic peptides during downstream processing",
    authors: "Kim et al.",
    venue: "Journal of Pharmaceutical Sciences",
    year: 2023,
    abstract:
      "Therapeutic peptide formulations are susceptible to aggregation during hold steps at intermediate temperatures. We demonstrate that pH drift combined with moderate shear rates accelerates fibril formation in buffer systems commonly used in bioprocessing. Continuous pH monitoring and increased buffer capacity reduced aggregation rates by up to 60% in model systems.",
    takeaway:
      "pH stability during hold steps is a stronger predictor of aggregation than temperature alone — aligns with our run 3 observations.",
    href: "https://doi.org/10.1016/example.2023.001",
  },
  {
    id: "ctx-platform-2",
    type: "platform",
    annotation: "Reference data for expression optimization comparison.",
    addedBy: "Elena Rodriguez",
    addedAt: "2026-06-01T10:15:00.000Z",
    recordType: "Expression Run",
    title: "EXP-2024-0398 — E. coli optimization",
    outcome: "85 mg/L yield, optimal conditions identified",
    href: "https://platform.adaptyv.example/experiments/exp-2024-0398",
    owner: "Elena Rodriguez",
    metrics: [
      { label: "Yield", value: "85 mg/L" },
      { label: "Viability", value: "92%" },
      { label: "Expression time", value: "16 h" },
      { label: "Temperature", value: "25°C" },
    ],
  },
  {
    id: "ctx-supplier-2",
    type: "supplier",
    annotation: "Primary antibody source for epitope mapping studies.",
    addedBy: "Lisa Thompson",
    addedAt: "2026-05-30T13:45:00.000Z",
    supplierName: "AbCam Research",
    materialName: "Anti-Target Alpha mAb",
    docType: "Product Datasheet",
    href: "https://supplier.example/docs/ab-12345-datasheet.pdf",
    specs: [
      { label: "Clone", value: "4B7" },
      { label: "Isotype", value: "IgG1" },
      { label: "Concentration", value: "1 mg/ml" },
      { label: "Storage", value: "-20°C" },
      { label: "Lot number", value: "AB-12345-C" },
    ],
  },
];

// --- Planning board seed ---

export type PlanningSeedData = {
  tasks: Task[];
  workUnits: WorkUnit[];
  tickets: Ticket[];
};

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

function scaffoldForExperiment(
  experiment: ExperimentDetail,
  workflow: WorkflowTemplate,
): Task[] {
  const run = primaryRunForExperiment(experiment);
  if (!run) return [];
  return scaffoldTasks(toSummary(experiment), run, workflow);
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

function resolveWorkflow(experiment: ExperimentDetail): WorkflowTemplate | undefined {
  return (
    getWorkflowTemplate(experiment.type, experiment.methodName) ??
    getWorkflowTemplate(experiment.type)
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

  return scaffoldForExperiment(experiment, {
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
    scaffoldForExperiment(experiment, {
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

  const scaffolded = scaffoldForExperiment(experiment, {
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
  extra?: Partial<Task>,
): Task {
  const run = primaryRunForExperiment(experiment);
  return {
    ...source,
    id: nextTaskId(),
    experimentId: experiment.id,
    runId: run?.id,
    name: `${nameSuffix} — ${experiment.code}`,
    dependsOn: [],
    readiness: "ready",
    workUnitId: undefined,
    blockedReason: undefined,
    createdAt: daysAgo(createdDaysAgo),
    params: { ...source.params },
    ...extra,
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

type PlannedTicket = {
  unitIndex: number;
  dayOffset: number;
  staffIndex: number;
  status: Ticket["status"];
};

function buildTickets(
  workUnits: WorkUnit[],
  scheduleDays: string[],
  planned: PlannedTicket[],
): Ticket[] {
  const labTechs = seedStaff.filter((member) => member.role === "lab-tech");
  const tickets: Ticket[] = [];

  for (const plan of planned) {
    const workUnit = workUnits[plan.unitIndex];
    if (!workUnit) continue;

    tickets.push({
      id: nextTicketId(),
      workUnitId: workUnit.id,
      assigneeId: labTechs[plan.staffIndex % labTechs.length]!.id,
      scheduledDay: scheduleDays[plan.dayOffset]!,
      status: plan.status,
    });
  }

  return tickets;
}

function applyExecutionDemos(
  tasks: Task[],
  workUnits: WorkUnit[],
  tickets: Ticket[],
): Task[] {
  const taskById = new Map(tasks.map((t) => [t.id, t]));
  let next = [...tasks];

  const mutateUnitTasks = (
    unitIndex: number,
    patch: Partial<Task>,
  ): void => {
    const unit = workUnits[unitIndex];
    if (!unit) return;
    next = next.map((task) =>
      unit.taskIds.includes(task.id) ? { ...task, ...patch } : task,
    );
  };

  // Index 0: sent to LabOS (in progress in LabOS)
  mutateUnitTasks(0, {
    status: "in_progress",
    readiness: "in_labos",
  });

  // Index 5: all tasks completed (done ticket demo)
  mutateUnitTasks(5, {
    status: "completed",
    readiness: "in_labos",
  });

  // Index 6: all tasks failed (failed execution demo)
  mutateUnitTasks(6, {
    status: "failed",
    readiness: "blocked",
  });

  void taskById;
  void tickets;

  return refreshAllTaskReadiness(next);
}

// Unit index map after buildCuratedWorkUnits:
// 0–1 Acme expression siblings | 2 thermo overflow | 3 BLI attach | 4 production thermo
// 5 gentech pool (done ticket) | 6 rerun pair (failed ticket)

function buildCuratedTasks(): Task[] {
  let tasks: Task[] = [];

  const gentechPoolChain = scaffoldThroughStep(
    getExperiment("exp-gentech-expression"),
    TEMPLATE.exprRun,
    {
      createdDaysAgo: 8,
      paramOverrides: { [TEMPLATE.exprRun]: EXPR_BATCH_POOL },
    },
  );
  tasks.push(...gentechPoolChain);
  const gentechPoolTemplate = gentechPoolChain.find(
    (task) => task.taskTemplateId === TEMPLATE.exprRun,
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

  const epitopePoolChain = scaffoldThroughStep(
    getExperiment("exp-biopharma-epitope"),
    TEMPLATE.epitopePlatePrep,
    {
      createdDaysAgo: 9,
      paramOverrides: { [TEMPLATE.epitopePlatePrep]: EPITOPE_BATCH },
    },
  );
  tasks.push(...epitopePoolChain);
  const epitopePoolTemplate = epitopePoolChain.find(
    (task) => task.taskTemplateId === TEMPLATE.epitopePlatePrep,
  );
  if (epitopePoolTemplate) {
    tasks.push(
      cloneReadyTask(
        epitopePoolTemplate,
        getExperiment("exp-biopharma-epitope"),
        8,
        "Epitope plate prep",
      ),
      cloneReadyTask(
        epitopePoolTemplate,
        getExperiment("exp-biopharma-epitope"),
        7,
        "Epitope plate prep",
      ),
    );
  }

  const medcoreBliChain = scaffoldThroughStep(
    getExperiment("exp-medcore-screen"),
    TEMPLATE.bliRun,
    {
      createdDaysAgo: 10,
      paramOverrides: { [TEMPLATE.bliRun]: BLI_BATCH },
    },
  );
  tasks.push(...medcoreBliChain);
  const medcoreBliTemplate = medcoreBliChain.find(
    (task) => task.taskTemplateId === TEMPLATE.bliRun,
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

  tasks.push(
    ...scaffoldThroughStep(getExperiment("exp-fredy-expression"), TEMPLATE.exprRun, {
      createdDaysAgo: 5,
      paramOverrides: { [TEMPLATE.exprRun]: EXPR_BATCH_B },
    }),
  );
  tasks.push(
    ...scaffoldThroughStep(getExperiment("exp-medcore-affinity"), TEMPLATE.sprPrep, {
      createdDaysAgo: 9,
    }),
  );

  const acmeExprChain = scaffoldThroughStep(
    getExperiment("exp-acme-expression"),
    TEMPLATE.exprRun,
    {
      createdDaysAgo: 11,
      paramOverrides: { [TEMPLATE.exprRun]: EXPR_BATCH_A },
    },
  );
  tasks.push(...acmeExprChain);
  const acmeExprTemplate = acmeExprChain.find(
    (task) => task.taskTemplateId === TEMPLATE.exprRun,
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

  const thermoOverflowChain = scaffoldThroughStep(
    getExperiment("exp-fredy-thermo"),
    TEMPLATE.exprPlatePrep,
    { createdDaysAgo: 6 },
  );
  tasks.push(...thermoOverflowChain);
  const thermoPrepTemplate = thermoOverflowChain.find(
    (task) => task.taskTemplateId === TEMPLATE.exprPlatePrep,
  );
  if (thermoPrepTemplate) {
    const overflowClones = [
      cloneReadyTask(
        thermoPrepTemplate,
        getExperiment("exp-fredy-thermo"),
        5,
        "Expression Plate Prep",
        { inputSampleCount: 96 },
      ),
      cloneReadyTask(
        thermoPrepTemplate,
        getExperiment("exp-fredy-thermo"),
        4,
        "Expression Plate Prep",
        { inputSampleCount: 96 },
      ),
      cloneReadyTask(
        thermoPrepTemplate,
        getExperiment("exp-fredy-thermo"),
        3,
        "Expression Plate Prep",
        { inputSampleCount: 96 },
      ),
      cloneReadyTask(
        thermoPrepTemplate,
        getExperiment("exp-fredy-thermo"),
        2,
        "Expression Plate Prep",
        { inputSampleCount: 96 },
      ),
    ];
    tasks.push(...overflowClones);
  }

  tasks.push(
    ...scaffoldThroughStep(getExperiment("exp-production-1"), TEMPLATE.thermoRun, {
      createdDaysAgo: 4,
    }),
  );

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
      TEMPLATE.review,
      {
        createdDaysAgo: 16,
        blockedOn: { templateId: TEMPLATE.review, reason: "awaiting_client" },
      },
    ),
  );

  const missingParamsTask = scaffoldFirstStep(getExperiment("exp-acme-binding"), 12)[0];
  if (missingParamsTask) {
    tasks.push({
      ...missingParamsTask,
      id: nextTaskId(),
      params: {},
      blockedReason: "missing_params",
      readiness: "blocked",
    });
  }

  const upstreamBlocked = scaffoldFirstStep(getExperiment("exp-medcore-screen"), 11)[0];
  if (upstreamBlocked) {
    tasks.push({
      ...upstreamBlocked,
      id: nextTaskId(),
      blockedReason: "upstream_not_done",
      readiness: "blocked",
    });
  }

  const otherBlocked = scaffoldFirstStep(getExperiment("exp-gentech-stability"), 10)[0];
  if (otherBlocked) {
    tasks.push({
      ...otherBlocked,
      id: nextTaskId(),
      blockedReason: "other",
      readiness: "blocked",
    });
  }

  tasks.push(
    ...scaffoldPendingSecondStep(getExperiment("exp-biopharma-epitope"), 11),
    ...scaffoldPendingSecondStep(getExperiment("exp-gentech-stability"), 10),
  );

  tasks.push(
    createStandaloneTask(TEMPLATE.bufferPrep, {
      buffer_k: 2,
      buffer_be: 1,
      buffer_r: 0.5,
    }),
    createStandaloneTask(TEMPLATE.bufferPrep, {
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
      task.taskTemplateId === TEMPLATE.exprRun &&
      task.params.expression_temperature === EXPR_BATCH_A.expression_temperature &&
      task.params.expression_time === EXPR_BATCH_A.expression_time,
  );

  const acmeExprRuns = readyExprA.filter(
    (task) => task.experimentId === "exp-acme-expression",
  );
  const thermoOverflowRuns = tasks.filter(
    (task) =>
      task.readiness === "ready" &&
      !task.workUnitId &&
      task.taskTemplateId === TEMPLATE.exprPlatePrep &&
      task.experimentId === "exp-fredy-thermo",
  );

  const medcoreBliRuns = tasks.filter(
    (task) =>
      task.readiness === "ready" &&
      !task.workUnitId &&
      task.taskTemplateId === TEMPLATE.bliRun &&
      task.experimentId === "exp-medcore-screen",
  );

  const productionThermo = tasks.find(
    (task) =>
      task.readiness === "ready" &&
      task.taskTemplateId === TEMPLATE.thermoRun &&
      task.experimentId === "exp-production-1",
  );

  const gentechPoolRuns = tasks.filter(
    (task) =>
      task.readiness === "ready" &&
      !task.workUnitId &&
      task.taskTemplateId === TEMPLATE.exprRun &&
      task.experimentId === "exp-gentech-expression" &&
      task.params.expression_temperature === EXPR_BATCH_POOL.expression_temperature,
  );

  const reruns = tasks.filter((task) => task.origin === "rerun" && !task.workUnitId);

  const workUnits: WorkUnit[] = [];

  if (acmeExprRuns.length >= 4) {
    workUnits.push(
      createWorkUnitFromTasks(acmeExprRuns.slice(0, 2), { status: "draft" }),
    );
    workUnits.push(
      createWorkUnitFromTasks(acmeExprRuns.slice(2, 4), { status: "ready" }),
    );
  }

  if (thermoOverflowRuns.length >= 5) {
    workUnits.push(createWorkUnitFromTasks(thermoOverflowRuns.slice(0, 5)));
  }

  if (medcoreBliRuns.length >= 1) {
    workUnits.push(createWorkUnitFromTasks([medcoreBliRuns[0]!]));
  }

  if (productionThermo) {
    workUnits.push(createWorkUnitFromTasks([productionThermo]));
  }

  if (gentechPoolRuns.length >= 2) {
    workUnits.push(
      createWorkUnitFromTasks(gentechPoolRuns.slice(0, 2), { status: "ready" }),
    );
  }

  if (reruns.length >= 2) {
    workUnits.push(createWorkUnitFromTasks(reruns.slice(0, 2)));
  } else if (reruns.length === 1) {
    workUnits.push(createWorkUnitFromTasks(reruns));
  }

  return workUnits.map((workUnit) =>
    workUnit.status ? workUnit : { ...workUnit, status: "draft" as const },
  );
}

export function buildPlanningSeedData(): PlanningSeedData {
  resetTaskIdCounter(1000);
  resetWorkUnitIdCounter(2000);
  resetTicketIdCounter(3000);

  const referenceDay = new Date().toISOString().slice(0, 10);
  const scheduleDays = buildScheduleDays(referenceDay);

  let tasks = buildCuratedTasks();
  const workUnits = buildCuratedWorkUnits(tasks);

  const plannedTickets: PlannedTicket[] = [
    { unitIndex: 0, dayOffset: 0, staffIndex: 0, status: "sent" },
    { unitIndex: 4, dayOffset: 0, staffIndex: 1, status: "scheduled" },
    { unitIndex: 1, dayOffset: 1, staffIndex: 2, status: "scheduled" },
    { unitIndex: 5, dayOffset: 0, staffIndex: 3, status: "scheduled" },
    { unitIndex: 6, dayOffset: 2, staffIndex: 4, status: "scheduled" },
    { unitIndex: 2, dayOffset: 0, staffIndex: 5, status: "scheduled" },
  ];

  const tickets = buildTickets(workUnits, scheduleDays, plannedTickets);
  tasks = attachTasksToWorkUnits(tasks, workUnits);
  tasks = applyExecutionDemos(tasks, workUnits, tickets);

  return { tasks, workUnits, tickets };
}

export function validatePlanningSeed(data: PlanningSeedData): boolean {
  if (data.tasks.length === 0 || data.workUnits.length === 0) return false;

  const unscheduled = getUnscheduledWorkUnits(data.workUnits, data.tickets);
  const queue = classifyReadyTasks(data.tasks, unscheduled);

  const blockedReasons = new Set(
    data.tasks
      .filter((t) => t.blockedReason)
      .map((t) => t.blockedReason),
  );

  return (
    queue.pool.length > 0 &&
    queue.attach.length > 0 &&
    queue.alone.length > 0 &&
    data.tickets.length >= 4 &&
    blockedReasons.has("missing_materials") &&
    blockedReasons.has("missing_params") &&
    blockedReasons.has("awaiting_client") &&
    blockedReasons.has("upstream_not_done") &&
    blockedReasons.has("other") &&
    data.tasks.some((t) => t.origin === "rerun")
  );
}

export { seedPlateStocks, seedPlateStocksByType } from "@/data/plate-stocks";