import { describe, expect, it } from "vitest";

import {
  countExperimentsInWorkUnit,
  getExperimentsInWorkUnit,
  getPrimaryExperimentId,
  getTaskTitle,
  getWorkUnitTemplateLabel,
} from "@/domain/planning/display";
import { buildExperimentsById } from "@/domain/experiment";
import type { WorkUnit } from "@/domain/work-unit/types";
import { planningSeed, seedExperiments } from "@/test/fixtures";

describe("planning display", () => {
  const experimentsById = buildExperimentsById(seedExperiments);
  const task = planningSeed.tasks.find((entry) => entry.experimentId)!;
  const workUnit: WorkUnit = {
    id: "display-unit",
    taskTemplateId: task.taskTemplateId,
    workUnitKey: "display-key",
    taskIds: [task.id],
    status: "ready",
  };

  it("uses task name when present otherwise template label", () => {
    expect(getTaskTitle({ ...task, name: "Custom label" })).toBe("Custom label");
    expect(getTaskTitle({ ...task, name: undefined })).toMatch(/\S+/);
  });

  it("counts and lists experiments in a work unit", () => {
    const tasks = planningSeed.tasks.filter((entry) => entry.id === task.id);

    expect(getPrimaryExperimentId(task)).toBe(task.experimentId);
    expect(countExperimentsInWorkUnit(tasks, experimentsById)).toBe(1);
    expect(getExperimentsInWorkUnit(tasks, experimentsById)[0]?.id).toBe(task.experimentId);
  });

  it("returns a template label for work units", () => {
    expect(getWorkUnitTemplateLabel(workUnit)).toMatch(/\S+/);
  });
});
