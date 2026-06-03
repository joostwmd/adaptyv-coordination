import { describe, expect, it } from "vitest";

import {
  getOverflowByUnitId,
  isUnitOverflowing,
} from "@/domain/planning/overflow";
import { planningSeed } from "@/test/fixtures";

describe("overflow", () => {
  it("marks units whose aggregated resources exceed capacity", () => {
    const overflowingUnit = planningSeed.workUnits.find((workUnit) =>
      isUnitOverflowing(workUnit, planningSeed.tasks),
    );

    expect(overflowingUnit).toBeDefined();
    expect(getOverflowByUnitId([overflowingUnit!], planningSeed.tasks).get(overflowingUnit!.id)).toBe(
      true,
    );
  });

  it("returns false for units within capacity", () => {
    const withinCapacityUnit = planningSeed.workUnits.find(
      (workUnit) => !isUnitOverflowing(workUnit, planningSeed.tasks),
    );

    expect(withinCapacityUnit).toBeDefined();
    expect(
      getOverflowByUnitId([withinCapacityUnit!], planningSeed.tasks).get(
        withinCapacityUnit!.id,
      ),
    ).toBe(false);
  });
});
