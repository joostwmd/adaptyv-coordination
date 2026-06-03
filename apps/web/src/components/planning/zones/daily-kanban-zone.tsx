import { Badge } from "@adaptyv-coordination/ui/components/badge";
import { usePlanningBoard } from "@/hooks/usePlanningBoard";

import { DraggableTicket } from "../dnd/draggable-ticket";
import { KanbanDropCell } from "../dnd/kanban-drop-cell";
import {
  AnimatedBoardItem,
  AnimatedBoardList,
} from "./animated-board-item";
import { DateStepper } from "./date-stepper";
import { ZoneShell } from "./zone-shell";

export function DailyKanbanZone() {
  const board = usePlanningBoard();
  const ticketCount = Object.values(board.ticketsByPerson).reduce(
    (total, column) => total + column.length,
    0,
  );

  return (
    <ZoneShell
      title="Daily kanban"
      description="Who does what on which day"
      count={ticketCount}
      actions={<DateStepper currentDay={board.currentDay} />}
      className="min-h-[220px]"
    >
      {board.kanbanRoster.length === 0 ? (
        <p className="text-xs text-muted-foreground">No lab techs configured.</p>
      ) : (
        <div className="min-w-0 w-full overflow-x-auto pb-1">
          <div className="flex w-max gap-3">
            {board.kanbanRoster.map((member) => {
              const tickets = board.ticketsByPerson[member.id] ?? [];

              return (
                <div
                  key={member.id}
                  className="flex w-[400px] min-w-[360px] shrink-0 flex-col gap-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium">{member.handle}</p>
                    <Badge variant="secondary" className="shrink-0 text-[10px]">
                      {tickets.length} {tickets.length === 1 ? "unit" : "units"}
                    </Badge>
                  </div>
                  <KanbanDropCell staffId={member.id} day={board.currentDay}>
                    <AnimatedBoardList className="space-y-2">
                      {tickets.length === 0 ? (
                        <p className="py-6 text-center text-xs text-muted-foreground">
                          Drop a unit here
                        </p>
                      ) : (
                        tickets.map((ticket) => (
                          <AnimatedBoardItem key={ticket.id} id={ticket.id}>
                            <DraggableTicket
                              ticket={ticket}
                              layoutId={`ticket-${ticket.id}`}
                            />
                          </AnimatedBoardItem>
                        ))
                      )}
                    </AnimatedBoardList>
                  </KanbanDropCell>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </ZoneShell>
  );
}
