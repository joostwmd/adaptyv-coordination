import { MOCK_PLATE_STOCKS, MOCK_PLATE_STOCKS_BY_TYPE } from "@/data/seedData";

import { getPlateType, PLATE_TYPES, PLATE_TYPES_BY_ID } from "./plate-types";
import type { PlateStock, PlateType } from "./types";

export { getPlateType, PLATE_TYPES, PLATE_TYPES_BY_ID };
export type { PlateStock, PlateType };

export const PLATE_STOCKS: PlateStock[] = MOCK_PLATE_STOCKS;

export function getPlateStocksByType(plateTypeId: string): PlateStock[] {
  return MOCK_PLATE_STOCKS_BY_TYPE[plateTypeId] ?? [];
}

export function getPlateStock(id: string): PlateStock | undefined {
  return PLATE_STOCKS.find((s) => s.id === id);
}
