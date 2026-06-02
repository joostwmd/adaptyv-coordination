import { PLATE_TYPES_GENERATED } from "./plate-types.generated";
import type { PlateType } from "./types";

/** Curated well capacities keyed by plate type id. */
const PLATE_CAPACITY_WELLS: Record<string, number> = {
  "01915ab3-7191-187f-e41f-272e8b98abb4": 96,
  "01915ab4-ce85-34e1-6a6b-2d45bdcf748b": 96,
  "0191dc24-1076-4efb-d284-57469b427870": 96,
  "01915ab3-c658-f6d8-6df0-ed8d6cb602ad": 384,
  "0193485c-a571-4e7c-e947-eed126702e4b": 384,
  "01969fa0-50f9-0585-7660-028e108e04e0": 96,
  "019afd98-340b-5ba9-031f-a4c3b3540290": 384,
  "019cfb59-e8f9-766a-4444-9c0c3bfc2dc4": 1536,
  "019a6e90-8acd-63f6-a1fe-cc81bc7a19f3": 384,
  "01909828-07ab-ac80-19a3-f81d5ee1b1fa": 96,
  "0198ec14-d5ba-90f6-7829-5d406bb94ed3": 8,
  "019afe4e-4d60-176a-2bf6-9bd5ced3fe87": 8,
};

export const PLATE_TYPES: PlateType[] = PLATE_TYPES_GENERATED.map((p) => ({
  ...p,
  capacityWells: PLATE_CAPACITY_WELLS[p.id],
}));

export const PLATE_TYPES_BY_ID: Record<string, PlateType> = Object.fromEntries(
  PLATE_TYPES.map((p) => [p.id, p]),
);

export function getPlateType(id: string): PlateType | undefined {
  return PLATE_TYPES_BY_ID[id];
}
