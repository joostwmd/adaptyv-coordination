import { useTicketsDayBoard } from "@/hooks/useTicketsDayBoard";
import { DateStepper } from "@/features/planning";

import { TicketsStaffRow } from "./tickets-staff-row";

export function TicketsScreen() {
  const { currentDay, rows } = useTicketsDayBoard();

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden px-3 py-2">
      <header className="flex shrink-0 items-center justify-between gap-3 border-b pb-2">
        <div className="min-w-0 space-y-0.5">
          <h1 className="text-sm font-semibold tracking-tight">Tickets</h1>
          <p className="text-xs text-muted-foreground">
            Daily execution queue for lab technicians
          </p>
        </div>
        <DateStepper currentDay={currentDay} />
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto pt-3">
        {rows.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No tickets scheduled for this day.
          </p>
        ) : (
          rows.map((row) => (
            <TicketsStaffRow
              key={row.member.id}
              member={row.member}
              tickets={row.tickets}
            />
          ))
        )}
      </div>
    </div>
  );
}
