export type WorkUnitStatus = "draft" | "ready" | "sent";

export type WorkUnit = {
  id: string;
  taskTemplateId: string;
  workUnitKey: string;
  taskIds: string[];
  status: WorkUnitStatus;
};

export type AggregatedResources = Record<string, number>;

export type CapacityOverflow = {
  resourceType: string;
  used: number;
  limit: number;
};

export type CapacityStatus = {
  withinCapacity: boolean;
  overflows: CapacityOverflow[];
};

export type WorkUnitPriority = {
  score: number;
  driverTaskId: string;
};
