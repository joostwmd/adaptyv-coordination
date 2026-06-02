export type TicketStatus = "scheduled" | "sent";

/** One scheduled placement: a work unit on one day for one person (1:1 with work unit). */
export type Ticket = {
  id: string;
  workUnitId: string;
  assigneeId: string;
  scheduledDay: string;
  status: TicketStatus;
};
