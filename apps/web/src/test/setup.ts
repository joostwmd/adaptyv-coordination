import { beforeEach } from "vitest";

import { resetTaskIdCounter } from "@/domain/task/scaffold";
import { resetWorkUnitIdCounter } from "@/domain/work-unit/grouping";

import { planningSeed, seedExperiments, seedStaff } from "./fixtures";

// Fail fast if mock data cannot be imported (fixtures module validates planning seed).
void planningSeed;
void seedExperiments;
void seedStaff;

beforeEach(() => {
  resetTaskIdCounter(1000);
  resetWorkUnitIdCounter(2000);
});
