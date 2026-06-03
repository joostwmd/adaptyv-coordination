import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  clampPlanningDay,
  getDefaultPlanningDay,
  getPlanningDayBounds,
  isPlanningDayInRange,
  parsePlanningDay,
  stepPlanningDay,
  toPlanningDayString,
} from "@/domain/planning/planning-dates";

const REFERENCE = new Date("2026-06-03T12:00:00");

describe("planning-dates", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(REFERENCE);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("formats and parses planning day strings", () => {
    expect(toPlanningDayString(REFERENCE)).toBe("2026-06-03");
    expect(parsePlanningDay("2026-06-03").getHours()).toBe(12);
  });

  it("computes a symmetric day window around today", () => {
    const { minDay, maxDay } = getPlanningDayBounds(REFERENCE);

    expect(minDay).toBe("2026-05-20");
    expect(maxDay).toBe("2026-06-17");
    expect(isPlanningDayInRange("2026-06-03")).toBe(true);
    expect(isPlanningDayInRange("2026-05-19")).toBe(false);
    expect(isPlanningDayInRange("2026-06-18")).toBe(false);
  });

  it("clamps days outside the allowed window", () => {
    const { minDay, maxDay } = getPlanningDayBounds(REFERENCE);

    expect(clampPlanningDay("2020-01-01")).toBe(minDay);
    expect(clampPlanningDay("2030-01-01")).toBe(maxDay);
    expect(clampPlanningDay("2026-06-03")).toBe("2026-06-03");
  });

  it("steps forward and backward within bounds", () => {
    expect(stepPlanningDay("2026-06-03", 1)).toBe("2026-06-04");
    expect(stepPlanningDay("2026-06-03", -1)).toBe("2026-06-02");
    expect(stepPlanningDay(getPlanningDayBounds(REFERENCE).maxDay, 1)).toBe(
      getPlanningDayBounds(REFERENCE).maxDay,
    );
  });

  it("defaults to today as a planning day string", () => {
    expect(getDefaultPlanningDay()).toBe("2026-06-03");
  });
});
