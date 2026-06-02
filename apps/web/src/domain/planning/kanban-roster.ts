import type { StaffMember } from "@/types";
import { getStaffHandle } from "@/types";

export type KanbanRosterMember = {
  id: string;
  name: string;
  handle: string;
};

export function getKanbanRoster(staff: StaffMember[]): KanbanRosterMember[] {
  return staff
    .filter((member) => member.role === "lab-tech")
    .map((member) => ({
      id: member.id,
      name: member.name,
      handle: getStaffHandle(member.name),
    }));
}
