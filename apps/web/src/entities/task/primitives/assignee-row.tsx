import type { StaffMember } from "@/types";

import { StaffAvatar } from "./staff-avatar";

type AssigneeRowProps = {
  assignee: StaffMember;
};

export function AssigneeRow({ assignee }: AssigneeRowProps) {
  return (
    <div className="flex items-center gap-2 text-xs/relaxed">
      <StaffAvatar member={assignee} />
      <span className="text-muted-foreground">Assigned to</span>
      <span>{assignee.name}</span>
    </div>
  );
}
