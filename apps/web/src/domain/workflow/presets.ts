import type { WorkflowTemplate } from "./types";

const T = {
  dnaRecon: "01909d1c-7da1-79aa-fe76-4c350d61a79c",
  dnaDilution: "1dc35aba-79f2-423f-bfad-1042ee19e6fd",
  combinePlates: "019a727e-09cd-6a39-36de-3fc7aaf8ca4b",
  exprPlatePrep: "a52e40c7-db76-46fe-bdc5-bf51522457c1",
  exprRun: "3e7749a4-d7b7-44a8-b1f3-e2e61dbba64c",
  exprDilution: "019662b2-9810-c712-7501-98b5b6a68b58",
  antigenRecon: "0195615e-c56d-603b-0b43-522cbdb52634",
  antigenBufferExchange: "01909d14-af95-75e6-4a02-7349858be9b2",
  antigenQuant: "01909d1c-12e6-85eb-5a52-2b90222f39c3",
  bliPlatePrep: "f94f1058-8e24-4471-aa8b-406b0564cfbf",
  bliRun: "1fa2fc3f-adc6-46df-96cb-cafc71f7e7c9",
  sprPrep: "01979c72-1e66-2a8e-555b-3cf5c9f56a06",
  sprRun: "01954733-5f3c-c54a-ac46-720de477e712",
  splitGfpPlatePrep: "019745e0-6bed-a163-c43c-1a7e6350d817",
  splitGfpRun: "0193485d-43e6-4dc7-0cee-e3095614bce7",
  thermoCapPrep: "0196a00c-e983-91f4-4131-096e8db90a40",
  thermoRun: "0196a064-9351-576b-9c4c-3b08f48f1f1e",
  dataAnalysis: "01909d1e-1fdf-c8dc-ae7e-72ab364800b7",
  review: "01909d1e-85a5-fc3a-97f0-5a0773cfe3c9",
} as const;

export const WORKFLOW_PRESETS: WorkflowTemplate[] = [
  {
    id: "binding-screening-bli",
    experimentType: "binding_screening",
    methodName: "BLI",
    label: "Binding Screening (BLI)",
    steps: [
      { taskTemplateId: T.dnaRecon },
      { taskTemplateId: T.dnaDilution, optional: true },
      { taskTemplateId: T.exprPlatePrep },
      { taskTemplateId: T.exprRun },
      { taskTemplateId: T.exprDilution },
      { taskTemplateId: T.antigenRecon },
      { taskTemplateId: T.antigenBufferExchange },
      { taskTemplateId: T.antigenQuant },
      { taskTemplateId: T.bliPlatePrep },
      { taskTemplateId: T.bliRun },
      { taskTemplateId: T.dataAnalysis },
      { taskTemplateId: T.review },
    ],
  },
  {
    id: "affinity-characterization-spr",
    experimentType: "affinity_characterization",
    methodName: "SPR",
    label: "Affinity Characterization (SPR)",
    steps: [
      { taskTemplateId: T.dnaRecon },
      { taskTemplateId: T.exprPlatePrep },
      { taskTemplateId: T.exprRun },
      { taskTemplateId: T.antigenRecon },
      { taskTemplateId: T.antigenBufferExchange },
      { taskTemplateId: T.antigenQuant },
      { taskTemplateId: T.sprPrep },
      { taskTemplateId: T.sprRun },
      { taskTemplateId: T.dataAnalysis },
      { taskTemplateId: T.review },
    ],
  },
  {
    id: "expression",
    experimentType: "expression",
    label: "Expression",
    steps: [
      { taskTemplateId: T.dnaRecon },
      { taskTemplateId: T.dnaDilution },
      { taskTemplateId: T.exprPlatePrep },
      { taskTemplateId: T.exprRun },
      { taskTemplateId: T.exprDilution },
      { taskTemplateId: T.review },
    ],
  },
  {
    id: "thermostability",
    experimentType: "thermostability",
    label: "Thermostability",
    steps: [
      { taskTemplateId: T.exprPlatePrep },
      { taskTemplateId: T.exprRun },
      { taskTemplateId: T.thermoCapPrep },
      { taskTemplateId: T.thermoRun },
      { taskTemplateId: T.dataAnalysis },
      { taskTemplateId: T.review },
    ],
  },
  {
    id: "binding-screening-default",
    experimentType: "binding_screening",
    label: "Binding Screening (generic)",
    steps: [
      { taskTemplateId: T.dnaRecon },
      { taskTemplateId: T.exprPlatePrep },
      { taskTemplateId: T.exprRun },
      { taskTemplateId: T.bliPlatePrep },
      { taskTemplateId: T.bliRun },
      { taskTemplateId: T.review },
    ],
  },
];

export function getWorkflowTemplate(
  experimentType: WorkflowTemplate["experimentType"],
  methodName?: string,
): WorkflowTemplate | undefined {
  const exact = WORKFLOW_PRESETS.find(
    (w) =>
      w.experimentType === experimentType &&
      (methodName ? w.methodName === methodName : !w.methodName),
  );
  if (exact) return exact;

  return WORKFLOW_PRESETS.find(
    (w) => w.experimentType === experimentType && w.id.endsWith("-default"),
  );
}
