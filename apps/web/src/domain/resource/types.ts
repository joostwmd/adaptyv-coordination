export type ResourceKind = "machine" | "plate" | "operator" | "consumable";

export type ResourceDefinition = {
  id: string;
  name: string;
  kind: ResourceKind;
  capacity: number;
  unit?: string;
};
