import type { PlateStock } from "@/domain/plate/types";

/** Plate inventory for prototype demos (no task/domain imports — safe for catalog). */
export const seedPlateStocks: PlateStock[] = [
  {
    id: "plate-stock-expr-001",
    plateTypeId: "01915ab3-7191-187f-e41f-272e8b98abb4",
    code: "E-ACM-0042",
    materialStockId: "ms-expr-001",
    status: "assigned",
    description: "Expression plate — batch A",
  },
  {
    id: "plate-stock-expr-002",
    plateTypeId: "01915ab3-7191-187f-e41f-272e8b98abb4",
    code: "E-JAL-0118",
    materialStockId: "ms-expr-002",
    status: "available",
    description: "Expression plate — batch B",
  },
  {
    id: "plate-stock-antigen-recon-001",
    plateTypeId: "0195800b-b821-db27-a8ef-c1950ac21cea",
    code: "T-ALY-0001",
    materialStockId: "9a251e6a-e86c-55a7-8e74-1dfbea1563fc",
    status: "assigned",
    description: "Reconstituted antigen stock",
  },
  {
    id: "plate-stock-antigen-recon-002",
    plateTypeId: "0195800b-b821-db27-a8ef-c1950ac21cea",
    code: "T-TNQ-0087",
    materialStockId: "ms-antigen-002",
    status: "available",
  },
  {
    id: "plate-stock-dna-recon-001",
    plateTypeId: "0191dc24-1076-4efb-d284-57469b427870",
    code: "D-FRD-0203",
    materialStockId: "ms-dna-001",
    status: "assigned",
  },
  {
    id: "plate-stock-bli-001",
    plateTypeId: "01915ab3-c658-f6d8-6df0-ed8d6cb602ad",
    code: "B-JAL-0395",
    materialStockId: "ms-bli-001",
    status: "assigned",
    description: "BLI plate loaded for run",
  },
  {
    id: "plate-stock-purified-001",
    plateTypeId: "01969fa0-50f9-0585-7660-028e108e04e0",
    code: "P-FRD-3345",
    materialStockId: "ms-protein-001",
    status: "available",
  },
  {
    id: "plate-stock-cap-holder-001",
    plateTypeId: "01969fa4-0d05-51f1-5a2a-7859b64c5ee9",
    code: "C-HLD-0003",
    status: "assigned",
  },
];

export const seedPlateStocksByType: Record<string, PlateStock[]> =
  seedPlateStocks.reduce<Record<string, PlateStock[]>>((acc, stock) => {
    const list = acc[stock.plateTypeId] ?? [];
    list.push(stock);
    acc[stock.plateTypeId] = list;
    return acc;
  }, {});
