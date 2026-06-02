import type { 
  StaffMember, 
  ExperimentDetail, 
  ExperimentSummary, 
  Task, 
  ClientRef,
  ExperimentRunSummary 
} from "@/types";
import type { ContextItem } from "@/components/context/types";

// Seed clients - expanded from existing mock data
export const seedClients: ClientRef[] = [
  { id: "d4f8808e-f30f-542d-b533-d26b132034ae", name: "Fredy Therapeutics" },
  { id: "client-acme", name: "Acme Biologics" },
  { id: "client-biopharma", name: "BioPharma Solutions" },
  { id: "client-gentech", name: "GenTech Innovations" },
  { id: "client-medcore", name: "MedCore Research" },
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

// Seed experiments - based on existing mock data with additional experiments
export const seedExperiments: ExperimentDetail[] = [
  {
    id: "100a7e4a-8521-5ce9-b22c-7c4f88922623",
    code: "TNQ-711-657",
    name: "Target Alpha Characterization",
    priority: 26074,
    type: "affinity_characterization",
    typeLabel: "Affinity Characterization",
    methodName: "SPR",
    category: "rd",
    client: seedClients[0],
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
    client: seedClients[0],
    status: {
      name: "In production",
      color: "#10b981",
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
    client: seedClients[0],
    status: {
      name: "Waiting for materials",
      color: "#eab308",
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
  {
    id: "exp-acme-expression",
    code: "ACM-455-122",
    name: "Protein Expression Optimization",
    priority: 890234,
    type: "expression",
    typeLabel: "Expression",
    methodName: "E. coli BL21",
    category: "rd",
    client: seedClients[1],
    status: {
      name: "Active",
      color: "#3b82f6",
    },
    runs: [
      {
        id: "run-acm-pilot",
        name: "Pilot expression study",
        revisionIndex: 1,
        experimentId: "exp-acme-expression",
      },
      {
        id: "run-acm-scale",
        name: "Scale-up validation",
        revisionIndex: 2,
        experimentId: "exp-acme-expression",
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
    client: seedClients[2],
    status: {
      name: "Sample prep",
      color: "#f59e0b",
    },
    runs: [
      {
        id: "run-bps-mapping",
        name: "Initial epitope mapping",
        revisionIndex: 1,
        experimentId: "exp-biopharma-epitope",
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
    client: seedClients[3],
    status: {
      name: "Completed",
      color: "#10b981",
    },
    runs: [
      {
        id: "run-gti-stability",
        name: "6-month stability study",
        revisionIndex: 1,
        experimentId: "exp-gentech-stability",
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
    client: seedClients[4],
    status: {
      name: "Planning",
      color: "#6b7280",
    },
    runs: [
      {
        id: "run-mdc-hts",
        name: "HTS binding assay",
        revisionIndex: 1,
        experimentId: "exp-medcore-screen",
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
    client: seedClients[0],
    status: { name: "Active", color: "#3b82f6" },
    runs: [
      {
        id: "run-frd-pilot",
        name: "Pilot expression",
        revisionIndex: 1,
        experimentId: "exp-fredy-expression",
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
    client: seedClients[1],
    status: { name: "Planning", color: "#6b7280" },
    runs: [
      {
        id: "run-acm-bind",
        name: "DSF binding panel",
        revisionIndex: 1,
        experimentId: "exp-acme-binding",
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
    client: seedClients[4],
    status: { name: "Sample prep", color: "#f59e0b" },
    runs: [
      {
        id: "run-mdc-spr",
        name: "SPR titration series",
        revisionIndex: 1,
        experimentId: "exp-medcore-affinity",
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
    client: seedClients[2],
    status: { name: "Waiting for materials", color: "#eab308" },
    runs: [
      {
        id: "run-bps-bli",
        name: "BLI competitive panel",
        revisionIndex: 1,
        experimentId: "exp-biopharma-binding",
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
    client: seedClients[3],
    status: { name: "In production", color: "#10b981" },
    runs: [
      {
        id: "run-gti-expr",
        name: "Production expression",
        revisionIndex: 1,
        experimentId: "exp-gentech-expression",
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
    client: seedClients[0],
    status: { name: "In production", color: "#10b981" },
    runs: [
      {
        id: "run-frd-thermo",
        name: "Thermo capillary run",
        revisionIndex: 1,
        experimentId: "exp-fredy-thermo",
      },
    ],
  },
];

// Helper function to convert ExperimentDetail to ExperimentSummary
function toSummary(experiment: ExperimentDetail): ExperimentSummary {
  const { runs: _runs, ...summary } = experiment;
  return summary;
}

// Seed tasks - expanded from existing mock data with more comprehensive examples
export const seedTasks: Task[] = [
  {
    id: "task-1",
    title: "Review chromatography data for buffer swap revision",
    status: "pending",
    assignee: seedStaff[0], // Sarah Chen
    run: seedExperiments[0].runs[1], // TNQ buffer swap
    experiment: toSummary(seedExperiments[0]),
    notes: [
      {
        id: "note-1",
        author: seedStaff[1], // Marcus Webb
        body: "Compare peak shapes against baseline before signing off.",
        createdAt: "2026-05-30T10:00:00.000Z",
      },
      {
        id: "note-2",
        author: seedStaff[0], // Sarah Chen
        body: "Will need Marcus to confirm if the tailing factor is within spec.",
        createdAt: "2026-05-30T14:30:00.000Z",
      },
    ],
  },
  {
    id: "task-2",
    title: "Confirm production slot for thermostability batch",
    status: "success",
    assignee: seedStaff[2], // Alice Park
    run: seedExperiments[1].runs[0], // R3X production
    experiment: toSummary(seedExperiments[1]),
    notes: [
      {
        id: "note-3",
        author: seedStaff[2], // Alice Park
        body: "Slot confirmed with lab ops for next Tuesday.",
        createdAt: "2026-05-28T09:00:00.000Z",
      },
    ],
  },
  {
    id: "task-3",
    title: "Follow up on missing antigen shipment",
    status: "failed",
    assignee: seedStaff[3], // James Okonkwo
    run: seedExperiments[2].runs[0], // BSN binding screen
    experiment: toSummary(seedExperiments[2]),
    notes: [
      {
        id: "note-4",
        author: seedStaff[3], // James Okonkwo
        body: "Client confirmed delay — ETA pushed by two weeks.",
        createdAt: "2026-05-29T11:15:00.000Z",
      },
      {
        id: "note-5",
        author: seedStaff[1], // Marcus Webb
        body: "Escalated to account manager. Task blocked until materials arrive.",
        createdAt: "2026-05-29T16:00:00.000Z",
      },
      {
        id: "note-6",
        author: seedStaff[3], // James Okonkwo
        body: "Marked as failed for this planning cycle.",
        createdAt: "2026-05-30T08:00:00.000Z",
      },
    ],
  },
  {
    id: "task-4",
    title: "Prepare run protocol for baseline characterization",
    status: "pending",
    assignee: seedStaff[1], // Marcus Webb
    run: seedExperiments[0].runs[0], // TNQ baseline
    experiment: toSummary(seedExperiments[0]),
    notes: [
      {
        id: "note-7",
        author: seedStaff[0], // Sarah Chen
        body: "Use the same SPR chip lot as the previous Fredy program.",
        createdAt: "2026-05-27T13:00:00.000Z",
      },
    ],
  },
  {
    id: "task-5",
    title: "Set up expression vectors for pilot study",
    status: "pending",
    assignee: seedStaff[4], // Elena Rodriguez
    run: seedExperiments[3].runs[0], // Acme expression
    experiment: toSummary(seedExperiments[3]),
    notes: [
      {
        id: "note-8",
        author: seedStaff[4], // Elena Rodriguez
        body: "Cloning strategy approved by client. Starting vector preparation.",
        createdAt: "2026-06-01T09:00:00.000Z",
      },
    ],
  },
  {
    id: "task-6",
    title: "Analyze expression yield data",
    status: "success",
    assignee: seedStaff[5], // David Kumar
    run: seedExperiments[3].runs[1], // Acme scale-up
    experiment: toSummary(seedExperiments[3]),
    notes: [
      {
        id: "note-9",
        author: seedStaff[5], // David Kumar
        body: "Yield exceeded expectations at 95 mg/L. Ready for scale-up.",
        createdAt: "2026-06-01T16:30:00.000Z",
      },
    ],
  },
  {
    id: "task-7",
    title: "Prepare epitope mapping reagents",
    status: "pending",
    assignee: seedStaff[6], // Lisa Thompson
    run: seedExperiments[4].runs[0], // BioPharma epitope
    experiment: toSummary(seedExperiments[4]),
    notes: [],
  },
  {
    id: "task-8",
    title: "Complete stability study report",
    status: "success",
    assignee: seedStaff[2], // Alice Park
    run: seedExperiments[5].runs[0], // GenTech stability
    experiment: toSummary(seedExperiments[5]),
    notes: [
      {
        id: "note-10",
        author: seedStaff[2], // Alice Park
        body: "All stability criteria met. Report submitted to client.",
        createdAt: "2026-05-25T14:00:00.000Z",
      },
    ],
  },
  {
    id: "task-9",
    title: "Design HTS assay conditions",
    status: "pending",
    assignee: seedStaff[1], // Marcus Webb
    run: seedExperiments[6].runs[0], // MedCore screen
    experiment: toSummary(seedExperiments[6]),
    notes: [
      {
        id: "note-11",
        author: seedStaff[1], // Marcus Webb
        body: "Waiting for client approval on final compound library.",
        createdAt: "2026-06-02T11:00:00.000Z",
      },
    ],
  },
];

// Seed context items - based on existing mock data
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

// Create lookup maps for easy access
export const seedExperimentMap: Record<string, ExperimentDetail> = Object.fromEntries(
  seedExperiments.map((experiment) => [experiment.id, experiment])
);

export const seedStaffMap: Record<string, StaffMember> = Object.fromEntries(
  seedStaff.map((staff) => [staff.id, staff])
);

export const seedClientMap: Record<string, ClientRef> = Object.fromEntries(
  seedClients.map((client) => [client.id, client])
);

// Helper functions for data relationships
export function getExperimentById(id: string): ExperimentDetail | undefined {
  return seedExperimentMap[id];
}

export function getTasksByExperiment(experimentId: string): Task[] {
  return seedTasks.filter((task) => task.experiment.id === experimentId);
}

export function getTasksByAssignee(assigneeId: string): Task[] {
  return seedTasks.filter((task) => task.assignee.id === assigneeId);
}

export function getExperimentsByClient(clientId: string): ExperimentDetail[] {
  return seedExperiments.filter((exp) => exp.client.id === clientId);
}