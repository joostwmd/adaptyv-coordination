import type { StaffMember } from "@/types";

export type KanbanRosterMember = {
  id: string;
  name: string;
  handle: string;
};

export function filterLabTechStaff(staff: StaffMember[]): StaffMember[] {
  return staff.filter((member) => member.role === "lab-tech");
}

/** @deprecated Use filterLabTechStaff + handle formatting in the hook layer */
export function getKanbanRoster(
  staff: StaffMember[],
  formatHandle: (name: string) => string,
): KanbanRosterMember[] {
  return filterLabTechStaff(staff).map((member) => ({
    id: member.id,
    name: member.name,
    handle: formatHandle(member.name),
  }));
}
