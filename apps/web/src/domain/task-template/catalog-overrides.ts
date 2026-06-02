import type { PlanningMetaOverride } from "./planning-meta";

/**
 * Per-template planning metadata overrides.
 * Unlisted templates use inference from planning-meta.ts.
 */
export const CATALOG_OVERRIDES: Record<string, PlanningMetaOverride> = {
  // High-impact prep gates
  "01909d1c-7da1-79aa-fe76-4c350d61a79c": { impactWeight: 9, stage: "prep" },
  "a52e40c7-db76-46fe-bdc5-bf51522457c1": { impactWeight: 9, stage: "prep" },
  "f94f1058-8e24-4471-aa8b-406b0564cfbf": { impactWeight: 9, stage: "prep" },
  "01979c72-1e66-2a8e-555b-3cf5c9f56a06": { impactWeight: 9, stage: "prep" },
  "0195615e-c56d-603b-0b43-522cbdb52634": { impactWeight: 8, stage: "prep" },

  // Instrument runs
  "1fa2fc3f-adc6-46df-96cb-cafc71f7e7c9": {
    impactWeight: 7,
    stage: "run",
    batchKeyFields: ["probes_type", "kinetics"],
  },
  "01954733-5f3c-c54a-ac46-720de477e712": { impactWeight: 7, stage: "run" },
  "3e7749a4-d7b7-44a8-b1f3-e2e61dbba64c": {
    impactWeight: 7,
    stage: "run",
    batchKeyFields: ["expression_temperature", "expression_time", "property_4"],
  },
  "0196a064-9351-576b-9c4c-3b08f48f1f1e": {
    impactWeight: 6,
    stage: "run",
    batchKeyFields: [
      "temp_range_min",
      "temp_range_max",
      "temp_range_increment",
      "laser_intensity",
    ],
  },

  // Low-impact terminal / admin
  "01909d1e-85a5-fc3a-97f0-5a0773cfe3c9": { impactWeight: 1, stage: "analysis" },
  "01909d1e-1fdf-c8dc-ae7e-72ab364800b7": { impactWeight: 2, stage: "analysis" },
  "0197a17b-1929-35ec-481a-71898f21996b": { impactWeight: 1, stage: "analysis" },
  "0194e030-e704-b9ad-ebc8-6cf4007d5e73": { impactWeight: 1, stage: "analysis" },
};
