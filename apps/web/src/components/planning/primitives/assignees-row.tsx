import type { StaffMember } from "@/types";

import { StaffAvatar } from "@/components/task/primitives/staff-avatar";

type AssigneesRowProps = {
  assignees: StaffMember[];
};

export function AssigneesRow({ assignees }: AssigneesRowProps) {
  if (assignees.length === 0) {
    return <p className="text-xs text-muted-foreground">Unassigned</p>;
  }

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs/relaxed">
      {assignees.map((member) => (
        <div key={member.id} className="flex items-center gap-1.5">
          <StaffAvatar member={member} />
          <span>{member.name}</span>
        </div>
      ))}
    </div>
  );
}
