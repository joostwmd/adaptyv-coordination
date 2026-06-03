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
  /** When opened from a task, show assignment only — not full work unit + task list. */
  variant?: "assignment" | "full";
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function TicketDetailDialog({
  ticket,
  assignee,
  variant = "assignment",
  open,
  onOpenChange,
}: TicketDetailDialogProps) {
  const isAssignmentOnly = variant === "assignment";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {ticket ? (
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="sr-only">Ticket schedule</DialogTitle>
          </DialogHeader>
          <TicketContent
            ticket={ticket}
            assignee={assignee}
            showWorkUnitSummary={!isAssignmentOnly}
            showTasks={!isAssignmentOnly}
          />
        </DialogContent>
      ) : null}
    </Dialog>
  );
}
