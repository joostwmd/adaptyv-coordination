import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@adaptyv-coordination/ui/components/dialog";

import type { Ticket } from "@/domain/ticket/types";
import type { StaffMember } from "@/types";

import { TicketContent } from "./ticket-content";

type TicketDetailDialogProps = {
  ticket: Ticket | null;
  assignee?: StaffMember | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function TicketDetailDialog({
  ticket,
  assignee,
  open,
  onOpenChange,
}: TicketDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {ticket ? (
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="sr-only">Ticket schedule</DialogTitle>
          </DialogHeader>
          <TicketContent ticket={ticket} assignee={assignee} showTasks />
        </DialogContent>
      ) : null}
    </Dialog>
  );
}
