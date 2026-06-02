export type StaffRole = "lab-tech" | "planner";

export type StaffMember = {
  id: string;
  name: string;
  role: StaffRole;
};

export function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function getStaffHandle(name: string): string {
  const cleaned = name.replace(/^Dr\.\s+/i, "");
  const firstName = cleaned.split(/\s+/).find(Boolean) ?? cleaned;
  return `@${firstName}`;
}
