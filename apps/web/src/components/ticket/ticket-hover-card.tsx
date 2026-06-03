import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@adaptyv-coordination/ui/components/hover-card";
import { cn } from "@adaptyv-coordination/ui/lib/utils";
import type { ReactElement } from "react";

import type { Ticket } from "@/domain/ticket/types";
import type { StaffMember } from "@/types";

import { TicketContent } from "./ticket-content";

type TicketHoverCardProps = {
  ticket: Ticket;
  assignee?: StaffMember | null;
  trigger: ReactElement;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  contentClassName?: string;
};

export function TicketHoverCard({
  ticket,
  assignee,
  trigger,
  side = "top",
  align = "start",
  contentClassName,
}: TicketHoverCardProps) {
  return (
    <HoverCard>
      <HoverCardTrigger render={trigger} />
      <HoverCardContent
        side={side}
        align={align}
        className={cn("w-72 p-3", contentClassName)}
      >
        <TicketContent ticket={ticket} assignee={assignee} />
      </HoverCardContent>
    </HoverCard>
  );
}
