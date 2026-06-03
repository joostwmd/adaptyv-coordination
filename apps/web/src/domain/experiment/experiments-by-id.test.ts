import { describe, expect, it } from "vitest";

import { buildExperimentsById } from "@/domain/experiment/experiments-by-id";
import { seedExperiments } from "@/test/fixtures";

describe("buildExperimentsById", () => {
  it("indexes experiment summaries without run payloads", () => {
    const map = buildExperimentsById(seedExperiments);

    expect(Object.keys(map).length).toBe(seedExperiments.length);
    for (const experiment of seedExperiments) {
      expect(map[experiment.id]?.id).toBe(experiment.id);
      expect(map[experiment.id]).not.toHaveProperty("runs");
    }
  });
});
