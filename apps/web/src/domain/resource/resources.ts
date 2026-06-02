import type { ResourceDefinition } from "./types";

export const RESOURCE_DEFINITIONS: ResourceDefinition[] = [
  { id: "plate_well", name: "Plate wells", kind: "plate", capacity: 384, unit: "wells" },
  { id: "machine_slot", name: "Instrument slot", kind: "machine", capacity: 8, unit: "slots" },
  { id: "operator", name: "Operator", kind: "operator", capacity: 4, unit: "FTE" },
  { id: "sequence", name: "Sequences", kind: "consumable", capacity: 384, unit: "samples" },
  {
    id: "expression_incubator",
    name: "Expression incubator",
    kind: "machine",
    capacity: 4,
    unit: "runs",
  },
  {
    id: "machine:0ac01c79-7965-4f92-890e-58e9f9f90299",
    name: "Gator Pivot",
    kind: "machine",
    capacity: 2,
    unit: "instruments",
  },
  {
    id: "machine:7f873d69-af35-44f3-be22-0766fea0ad63",
    name: "Carterra SPR",
    kind: "machine",
    capacity: 1,
    unit: "instruments",
  },
  {
    id: "machine:469e1c54-785e-41c6-a77d-875d3a9808f5",
    name: "Liquid handler",
    kind: "machine",
    capacity: 2,
    unit: "instruments",
  },
  {
    id: "machine:7ec427d5-23b3-48d7-9045-340b1dd8b21a",
    name: "Expression system",
    kind: "machine",
    capacity: 4,
    unit: "runs",
  },
];

export const RESOURCES_BY_ID: Record<string, ResourceDefinition> = Object.fromEntries(
  RESOURCE_DEFINITIONS.map((r) => [r.id, r]),
);

export function getResourceDefinition(id: string): ResourceDefinition | undefined {
  return RESOURCES_BY_ID[id];
}
