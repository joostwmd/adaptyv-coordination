import {
  seedPlateStocks,
  seedPlateStocksByType,
} from "@/data/plate-stocks";

import { getPlateType, PLATE_TYPES, PLATE_TYPES_BY_ID } from "./plate-types";
import type { PlateStock, PlateType } from "./types";

export { getPlateType, PLATE_TYPES, PLATE_TYPES_BY_ID };
export type { PlateStock, PlateType };

export const PLATE_STOCKS: PlateStock[] = seedPlateStocks;

export function getPlateStocksByType(plateTypeId: string): PlateStock[] {
  return seedPlateStocksByType[plateTypeId] ?? [];
}

export function getPlateStock(id: string): PlateStock | undefined {
  return PLATE_STOCKS.find((s) => s.id === id);
}
