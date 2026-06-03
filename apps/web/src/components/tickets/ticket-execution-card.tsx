import { Button } from "@adaptyv-coordination/ui/components/button";

import type { Task } from "@/domain/task/types";
import type { Ticket } from "@/domain/ticket/types";
import { useTicketExecution } from "@/hooks/useTicketExecution";
import { TicketCard } from "@/components/planning/ticket-card";
import { PlanningSuggestionShell } from "@/components/planning/primitives/planning-suggestion-shell";

import { TicketExecutionStatusBadge } from "./ticket-execution-status";

type TicketExecutionCardProps = {
  ticket: Ticket;
  onTaskOpen: (task: Task) => void;
};

export function TicketExecutionCard({ ticket, onTaskOpen }: TicketExecutionCardProps) {
  const { status, sendToLabOs, complete, fail } = useTicketExecution(ticket.workUnitId);

  const canSendToLabOs =
    status === "not_started";
  const canMarkOutcome = status !== "not_started";

  return (
    <PlanningSuggestionShell
      headerLayout="stacked"
      className="w-[min(100%,28rem)] shrink-0 min-w-[22rem] sm:min-w-[26rem] sm:w-[28rem]"
      label={<TicketExecutionStatusBadge status={status} />}
      action={
        <>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!canSendToLabOs}
            onClick={sendToLabOs}
          >
            Send to Lab OS
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!canMarkOutcome}
            onClick={fail}
          >
            Mark failed
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!canMarkOutcome}
            onClick={complete}
          >
            Mark completed
          </Button>
        </>
      }
    >
      <TicketCard ticket={ticket} onTaskOpen={onTaskOpen} />
    </PlanningSuggestionShell>
  );
}
