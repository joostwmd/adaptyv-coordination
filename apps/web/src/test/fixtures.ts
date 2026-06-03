import {
  buildPlanningSeedData,
  seedClients,
  seedContextItems,
  seedExperiments,
  seedStaff,
  seedTasks,
  validatePlanningSeed,
  type PlanningSeedData,
} from "@/data/prototype-mock-data";

/** Planning board seed built once when the test module graph loads. */
export const planningSeed: PlanningSeedData = buildPlanningSeedData();

if (!validatePlanningSeed(planningSeed)) {
  throw new Error("Prototype planning seed failed validation — check prototype-mock-data.ts");
}

export function freshPlanningSeed(): PlanningSeedData {
  return buildPlanningSeedData();
}

export {
  buildPlanningSeedData,
  seedClients,
  seedContextItems,
  seedExperiments,
  seedStaff,
  seedTasks,
  validatePlanningSeed,
  type PlanningSeedData,
};
