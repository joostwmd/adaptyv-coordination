import type { ContextItem } from "./types";

export const MOCK_CONTEXT_ITEMS: ContextItem[] = [
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
];
