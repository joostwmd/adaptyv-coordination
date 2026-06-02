import type {
  ResourceProfile,
  ResourceRequirement,
  TaskStage,
  TaskTemplateBase,
} from "./types";
import { inferBatchKeyFields } from "./param-schema";

export type PlanningMetaOverride = {
  impactWeight?: number;
  stage?: TaskStage;
  batchKeyFields?: string[];
  resourceProfile?: ResourceProfile;
};

function inferStage(name: string): TaskStage {
  const n = name.toLowerCase();
  if (
    n.includes("run") &&
    !n.includes("prep") &&
    !n.includes("plate prep") &&
    !n.includes("standards prep")
  ) {
    return "run";
  }
  if (
    n.includes("review") ||
    n.includes("analysis") ||
    n.includes("data analysis") ||
    n.includes("maintenance") ||
    n.includes("other")
  ) {
    return "analysis";
  }
  return "prep";
}

function impactForStage(stage: TaskStage): number {
  switch (stage) {
    case "prep":
      return 8;
    case "run":
      return 5;
    case "analysis":
      return 2;
  }
}

function liquidHandlerProfile(): ResourceRequirement[] {
  return [
    { resourceType: "plate_well", scaling: "PER_TASK", amount: 96 },
    { resourceType: "operator", scaling: "PER_WORK_PACKAGE", amount: 1 },
  ];
}

function instrumentRunProfile(machineId?: string): ResourceRequirement[] {
  const reqs: ResourceRequirement[] = [
    { resourceType: "machine_slot", scaling: "PER_WORK_PACKAGE", amount: 1 },
    { resourceType: "sequence", scaling: "PER_TASK", amount: 1 },
  ];
  if (machineId) {
    reqs.push({
      resourceType: `machine:${machineId}`,
      scaling: "PER_WORK_PACKAGE",
      amount: 1,
    });
  }
  return reqs;
}

function expressionRunProfile(): ResourceRequirement[] {
  return [
    { resourceType: "plate_well", scaling: "PER_TASK", amount: 96 },
    { resourceType: "expression_incubator", scaling: "PER_WORK_PACKAGE", amount: 1 },
    { resourceType: "operator", scaling: "PER_WORK_PACKAGE", amount: 1 },
  ];
}

export function inferPlanningMeta(base: TaskTemplateBase): {
  impactWeight: number;
  stage: TaskStage;
  batchKeyFields: string[];
  resourceProfile: ResourceProfile;
} {
  const stage = inferStage(base.name);
  let resourceProfile: ResourceProfile = [
    { resourceType: "operator", scaling: "PER_WORK_PACKAGE", amount: 1 },
  ];

  const n = base.name.toLowerCase();
  if (base.machineTypeId && (n.includes("run") || n.includes("bli") || n.includes("spr"))) {
    resourceProfile = instrumentRunProfile(base.machineTypeId);
  } else if (n.includes("expression run")) {
    resourceProfile = expressionRunProfile();
  } else if (
    n.includes("dilution") ||
    n.includes("reconstitution") ||
    n.includes("combine") ||
    n.includes("cherry") ||
    n.includes("pcr") ||
    n.includes("purification") ||
    n.includes("plate prep")
  ) {
    resourceProfile = liquidHandlerProfile();
  } else if (base.plateTypeId) {
    resourceProfile = [
      { resourceType: "plate_well", scaling: "PER_TASK", amount: 96 },
      { resourceType: "operator", scaling: "PER_WORK_PACKAGE", amount: 1 },
    ];
  }

  return {
    impactWeight: impactForStage(stage),
    stage,
    batchKeyFields: inferBatchKeyFields(base.paramSchema.fields),
    resourceProfile,
  };
}

export function mergePlanningMeta(
  base: TaskTemplateBase,
  override?: PlanningMetaOverride,
) {
  const inferred = inferPlanningMeta(base);
  return {
    impactWeight: override?.impactWeight ?? inferred.impactWeight,
    stage: override?.stage ?? inferred.stage,
    batchKeyFields: override?.batchKeyFields ?? inferred.batchKeyFields,
    resourceProfile: override?.resourceProfile ?? inferred.resourceProfile,
  };
}
