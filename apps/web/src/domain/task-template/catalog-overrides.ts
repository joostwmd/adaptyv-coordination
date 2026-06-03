import type { PlanningMetaOverride } from "./planning-meta";

/**
 * Per-template planning metadata overrides.
 * Unlisted templates use inference from planning-meta.ts.
 */
export const CATALOG_OVERRIDES: Record<string, PlanningMetaOverride> = {
  // High-impact prep gates
  "01909d1c-7da1-79aa-fe76-4c350d61a79c": {
    impactWeight: 9,
    stage: "prep",
    requiredPlateTypes: ["0191dc24-1076-4efb-d284-57469b427870"],
  },
  "a52e40c7-db76-46fe-bdc5-bf51522457c1": {
    impactWeight: 9,
    stage: "prep",
    requiredPlateTypes: ["0195800b-b821-db27-a8ef-c1950ac21cea"],
  },
  "f94f1058-8e24-4471-aa8b-406b0564cfbf": { impactWeight: 9, stage: "prep" },
  "01979c72-1e66-2a8e-555b-3cf5c9f56a06": {
    impactWeight: 9,
    stage: "prep",
    requiredPlateTypes: ["0195800b-b821-db27-a8ef-c1950ac21cea"],
  },
  "0195615e-c56d-603b-0b43-522cbdb52634": {
    impactWeight: 8,
    stage: "prep",
    requiredPlateTypes: ["01957ccc-b11b-265e-34e3-c53d5ee0ad78"],
  },

  // Instrument runs
  "1fa2fc3f-adc6-46df-96cb-cafc71f7e7c9": {
    impactWeight: 7,
    stage: "run",
    batchKeyFields: ["probes_type", "kinetics"],
    requiredPlateTypes: ["01915ab3-c658-f6d8-6df0-ed8d6cb602ad"],
  },
  "01954733-5f3c-c54a-ac46-720de477e712": { impactWeight: 7, stage: "run" },
  "3e7749a4-d7b7-44a8-b1f3-e2e61dbba64c": {
    impactWeight: 7,
    stage: "run",
    batchKeyFields: ["expression_temperature", "expression_time", "property_4"],
    requiredPlateTypes: ["01915ab3-7191-187f-e41f-272e8b98abb4"],
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
    requiredPlateTypes: ["01969fa4-0d05-51f1-5a2a-7859b64c5ee9"],
  },
  "0196a00c-e983-91f4-4131-096e8db90a40": {
    impactWeight: 7,
    stage: "prep",
    requiredPlateTypes: ["01969fa0-50f9-0585-7660-028e108e04e0"],
  },

  // Low-impact terminal / admin
  "01909d1e-85a5-fc3a-97f0-5a0773cfe3c9": { impactWeight: 1, stage: "analysis" },
  "01909d1e-1fdf-c8dc-ae7e-72ab364800b7": { impactWeight: 2, stage: "analysis" },
  "0197a17b-1929-35ec-481a-71898f21996b": { impactWeight: 1, stage: "analysis" },
  "0194e030-e704-b9ad-ebc8-6cf4007d5e73": { impactWeight: 1, stage: "analysis" },
};
