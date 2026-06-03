import { getTaskTemplate } from "@/domain/task-template/catalog";
import type { TaskTemplate } from "@/domain/task-template/types";
import type { Task } from "@/types";

import { getPlateStocksByType, getPlateType } from "./catalog";
import type { PlateRequirement } from "./types";

/** Resolve required input plates for a single task (explicit data or template defaults). */
export function resolveRequiredPlatesForTask(task: Task): PlateRequirement[] {
  if (task.requiredPlates && task.requiredPlates.length > 0) {
    return task.requiredPlates;
  }
  const template = getTaskTemplate(task.taskTemplateId);
  if (!template) return [];
  return buildRequiredPlatesForTaskTemplate(template, task.taskTemplateId);
}

/** Merge plate requirements across batched tasks (one row per plate type). */
export function aggregateRequiredPlatesForTasks(tasks: Task[]): PlateRequirement[] {
  const byType = new Map<string, PlateRequirement>();

  for (const task of tasks) {
    for (const plate of resolveRequiredPlatesForTask(task)) {
      const existing = byType.get(plate.plateTypeId);
      if (!existing) {
        byType.set(plate.plateTypeId, plate);
        continue;
      }
      if (plate.isAssigned && !existing.isAssigned) {
        byType.set(plate.plateTypeId, plate);
        continue;
      }
      if (plate.plateCode && !existing.plateCode) {
        byType.set(plate.plateTypeId, {
          ...existing,
          plateCode: plate.plateCode,
          materialStockId: plate.materialStockId ?? existing.materialStockId,
          isAssigned: true,
        });
      }
    }
  }

  return [...byType.values()].sort((a, b) =>
    a.plateTypeName.localeCompare(b.plateTypeName),
  );
}

export type PlateAssignmentSeed = {
  plateTypeId: string;
  plateCode?: string;
  materialStockId?: string;
};

/**
 * Build required plate rows for a task from its template and optional mock assignments.
 */
export function buildRequiredPlatesForTemplate(
  template: TaskTemplate,
  assignments: PlateAssignmentSeed[] = [],
): PlateRequirement[] {
  const typeIds = template.requiredPlateTypes ?? [];
  if (typeIds.length === 0) return [];

  const assignmentByType = Object.fromEntries(
    assignments.map((a) => [a.plateTypeId, a]),
  );

  return typeIds.map((plateTypeId) => {
    const plateType = getPlateType(plateTypeId);
    const explicit = assignmentByType[plateTypeId];
    const fallbackStock = getPlateStocksByType(plateTypeId).find(
      (s) => s.status === "assigned",
    );
    const plateCode = explicit?.plateCode ?? fallbackStock?.code;
    const materialStockId =
      explicit?.materialStockId ?? fallbackStock?.materialStockId;

    return {
      plateTypeId,
      plateTypeName: plateType?.name ?? "Unknown plate type",
      plateCode,
      materialStockId,
      isAssigned: Boolean(plateCode),
      isRequired: true,
    } satisfies PlateRequirement;
  });
}

/** Default mock assignments per template for planning seed demos. */
export const TEMPLATE_PLATE_ASSIGNMENT_SEEDS: Record<string, PlateAssignmentSeed[]> =
  {
    // Expression run — expression plate assigned
    "3e7749a4-d7b7-44a8-b1f3-e2e61dbba64c": [
      { plateTypeId: "01915ab3-7191-187f-e41f-272e8b98abb4", plateCode: "E-ACM-0042" },
    ],
    // BLI plate prep — antigen assigned
    "a52e40c7-db76-46fe-bdc5-bf51522457c1": [
      {
        plateTypeId: "0195800b-b821-db27-a8ef-c1950ac21cea",
        plateCode: "T-ALY-0001",
        materialStockId: "9a251e6a-e86c-55a7-8e74-1dfbea1563fc",
      },
    ],
    // SPR prep — antigen assigned
    "01979c72-1e66-2a8e-555b-3cf5c9f56a06": [
      {
        plateTypeId: "0195800b-b821-db27-a8ef-c1950ac21cea",
        plateCode: "T-TNQ-0087",
      },
    ],
    // DNA reconstitution — assigned
    "01909d1c-7da1-79aa-fe76-4c350d61a79c": [
      { plateTypeId: "0191dc24-1076-4efb-d284-57469b427870", plateCode: "D-FRD-0203" },
    ],
    // Thermo capillary prep — missing plate (no assignment seed)
    "0196a00c-e983-91f4-4131-096e8db90a40": [],
    // Target prep reconstitution — lyophilised, unassigned
    "0195615e-c56d-603b-0b43-522cbdb52634": [],
  };

export function buildRequiredPlatesForTaskTemplate(
  template: TaskTemplate,
  taskTemplateId: string,
): PlateRequirement[] {
  const seeds = TEMPLATE_PLATE_ASSIGNMENT_SEEDS[taskTemplateId] ?? [];
  return buildRequiredPlatesForTemplate(template, seeds);
}
