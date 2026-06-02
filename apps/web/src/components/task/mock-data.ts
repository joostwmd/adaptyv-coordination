import type { ExperimentDetail, ExperimentSummary, StaffMember, Task } from "@/types";

export const MOCK_STAFF: StaffMember[] = [
  { id: "staff-sarah", name: "Sarah Chen" },
  { id: "staff-marcus", name: "Marcus Webb" },
  { id: "staff-alice", name: "Alice Park" },
  { id: "staff-james", name: "James Okonkwo" },
];

export const MOCK_EXPERIMENTS: ExperimentDetail[] = [
  {
    id: "100a7e4a-8521-5ce9-b22c-7c4f88922623",
    code: "TNQ-711-657",
    name: "Target Alpha Characterization",
    priority: 26074,
    type: "affinity_characterization",
    typeLabel: "Affinity Characterization",
    methodName: "SPR",
    category: "rd",
    client: {
      id: "d4f8808e-f30f-542d-b533-d26b132034ae",
      name: "Fredy Therapeutics",
    },
    status: {
      name: "Data analysis and validation",
      color: "#00C9E4",
    },
    runs: [
      {
        id: "run-tnq-baseline",
        name: "Baseline run",
        revisionIndex: 1,
        experimentId: "100a7e4a-8521-5ce9-b22c-7c4f88922623",
      },
      {
        id: "run-tnq-rev2",
        name: "Revision 2 — buffer swap",
        revisionIndex: 2,
        experimentId: "100a7e4a-8521-5ce9-b22c-7c4f88922623",
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
    client: {
      id: "client-fredy",
      name: "Fredy Therapeutics",
    },
    status: {
      name: "In production",
    },
    runs: [
      {
        id: "run-r3x-rev3",
        name: "Production revision 3",
        revisionIndex: 3,
        experimentId: "exp-production-1",
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
    client: {
      id: "client-fredy",
      name: "Fredy Therapeutics",
    },
    status: {
      name: "Waiting for materials",
    },
    runs: [
      {
        id: "run-bsn-rev1",
        name: "Initial binding panel",
        revisionIndex: 1,
        experimentId: "exp-binding-1",
      },
    ],
  },
];

export const MOCK_EXPERIMENT_MAP: Record<string, ExperimentDetail> = Object.fromEntries(
  MOCK_EXPERIMENTS.map((experiment) => [experiment.id, experiment]),
);

function toSummary(experiment: ExperimentDetail): ExperimentSummary {
  const { runs: _runs, ...summary } = experiment;
  return summary;
}

export const MOCK_TASKS: Task[] = [
  {
    id: "task-1",
    title: "Review chromatography data for buffer swap revision",
    status: "pending",
    assignee: MOCK_STAFF[0]!,
    run: MOCK_EXPERIMENTS[0]!.runs[1]!,
    experiment: toSummary(MOCK_EXPERIMENTS[0]!),
    notes: [
      {
        id: "note-1",
        author: MOCK_STAFF[1]!,
        body: "Compare peak shapes against baseline before signing off.",
        createdAt: "2026-05-30T10:00:00.000Z",
      },
      {
        id: "note-2",
        author: MOCK_STAFF[0]!,
        body: "Will need Marcus to confirm if the tailing factor is within spec.",
        createdAt: "2026-05-30T14:30:00.000Z",
      },
    ],
  },
  {
    id: "task-2",
    title: "Confirm production slot for thermostability batch",
    status: "success",
    assignee: MOCK_STAFF[2]!,
    run: MOCK_EXPERIMENTS[1]!.runs[0]!,
    experiment: toSummary(MOCK_EXPERIMENTS[1]!),
    notes: [
      {
        id: "note-3",
        author: MOCK_STAFF[2]!,
        body: "Slot confirmed with lab ops for next Tuesday.",
        createdAt: "2026-05-28T09:00:00.000Z",
      },
    ],
  },
  {
    id: "task-3",
    title: "Follow up on missing antigen shipment",
    status: "failed",
    assignee: MOCK_STAFF[3]!,
    run: MOCK_EXPERIMENTS[2]!.runs[0]!,
    experiment: toSummary(MOCK_EXPERIMENTS[2]!),
    notes: [
      {
        id: "note-4",
        author: MOCK_STAFF[3]!,
        body: "Client confirmed delay — ETA pushed by two weeks.",
        createdAt: "2026-05-29T11:15:00.000Z",
      },
      {
        id: "note-5",
        author: MOCK_STAFF[1]!,
        body: "Escalated to account manager. Task blocked until materials arrive.",
        createdAt: "2026-05-29T16:00:00.000Z",
      },
      {
        id: "note-6",
        author: MOCK_STAFF[3]!,
        body: "Marked as failed for this planning cycle.",
        createdAt: "2026-05-30T08:00:00.000Z",
      },
    ],
  },
  {
    id: "task-4",
    title: "Prepare run protocol for baseline characterization",
    status: "pending",
    assignee: MOCK_STAFF[1]!,
    run: MOCK_EXPERIMENTS[0]!.runs[0]!,
    experiment: toSummary(MOCK_EXPERIMENTS[0]!),
    notes: [
      {
        id: "note-7",
        author: MOCK_STAFF[0]!,
        body: "Use the same SPR chip lot as the previous Fredy program.",
        createdAt: "2026-05-27T13:00:00.000Z",
      },
    ],
  },
];

export function getExperimentById(id: string): ExperimentDetail | undefined {
  return MOCK_EXPERIMENT_MAP[id];
}
