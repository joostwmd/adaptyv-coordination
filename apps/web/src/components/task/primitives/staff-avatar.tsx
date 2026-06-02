import {
  Avatar,
  AvatarFallback,
} from "@adaptyv-coordination/ui/components/avatar";

import { getInitials, type StaffMember } from "@/types";

type StaffAvatarProps = {
  member: StaffMember;
  size?: "default" | "sm" | "lg";
};

export function StaffAvatar({ member, size = "sm" }: StaffAvatarProps) {
  return (
    <Avatar size={size}>
      <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
    </Avatar>
  );
}
