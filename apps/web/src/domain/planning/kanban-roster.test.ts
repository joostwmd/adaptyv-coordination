import { describe, expect, it } from "vitest";

import {
  filterLabTechStaff,
  getKanbanRoster,
} from "@/domain/planning/kanban-roster";
import { seedStaff } from "@/test/fixtures";

describe("kanban-roster", () => {
  it("filters to lab-tech staff only", () => {
    const labTechs = filterLabTechStaff(seedStaff);
    expect(labTechs.every((member) => member.role === "lab-tech")).toBe(true);
    expect(labTechs.length).toBeGreaterThan(0);
    expect(labTechs.length).toBeLessThan(seedStaff.length);
  });

  it("maps roster members with formatted handles", () => {
    const roster = getKanbanRoster(seedStaff, (name) => name.split(" ")[0]!.toLowerCase());

    expect(roster.length).toBe(filterLabTechStaff(seedStaff).length);
    expect(roster[0]?.handle).toBe(
      filterLabTechStaff(seedStaff)[0]!.name.split(" ")[0]!.toLowerCase(),
    );
  });
});
