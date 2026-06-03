import { getPlateStock, getPlateType } from "@/domain/plate/catalog";
import type { TaskTemplate } from "@/domain/task-template/types";

import type { PlateRequirement } from "./types";

export function requiredPlatesFromDraft(
  plateAssignments: Record<string, string | undefined>,
  template: TaskTemplate | undefined,
): PlateRequirement[] | undefined {
  const typeIds = template?.requiredPlateTypes ?? [];
  if (typeIds.length === 0) return undefined;

  const plates = typeIds.map((plateTypeId) => {
    const stockId = plateAssignments[plateTypeId];
    const stock = stockId ? getPlateStock(stockId) : undefined;
    const plateType = getPlateType(plateTypeId);
    return {
      plateTypeId,
      plateTypeName: plateType?.name ?? "Unknown plate type",
      plateCode: stock?.code,
      materialStockId: stock?.materialStockId,
      isAssigned: Boolean(stockId),
      isRequired: true,
    };
  });

  return plates.length > 0 ? plates : undefined;
}
