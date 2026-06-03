export type PlateType = {
  id: string;
  name: string;
  category?: string;
  capacityWells?: number;
};

export type PlateStockStatus = "available" | "assigned" | "used" | "depleted";

/** Physical plate instance in the lab (barcode / stock). */
export type PlateStock = {
  id: string;
  plateTypeId: string;
  code: string;
  materialStockId?: string;
  status: PlateStockStatus;
  description?: string;
};

/** Input plate a technician must load before running a task. */
export type PlateRequirement = {
  plateTypeId: string;
  plateTypeName: string;
  plateCode?: string;
  materialStockId?: string;
  isAssigned: boolean;
  isRequired: boolean;
};
