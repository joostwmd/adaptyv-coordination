import { useMemo, useState } from "react";

import type { Task } from "@/domain/task/types";
import { TaskCard } from "@/entities/task/task-card";
import { usePlanningStore, usePlanningTickets } from "@/stores/usePlanningStore";

import { TaskDetailDialog } from "./task-detail-dialog";
import { TicketCard } from "@/features/planning/cards/ticket-card";
import { WorkUnitCard } from "@/features/planning/cards/work-unit-card";

export function WorkUnitList() {
  const tickets = usePlanningTickets();
  const getWorkUnitPriority = usePlanningStore((s) => s.getWorkUnitPriority);
  const getUnscheduledWorkUnits = usePlanningStore((s) => s.getUnscheduledWorkUnits);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const unscheduledWorkUnits = getUnscheduledWorkUnits();

  const renderOpenableTask = (task: Task) => (
    <button
      type="button"
      className="w-full cursor-pointer text-left"
      onClick={() => setSelectedTask(task)}
    >
      <TaskCard task={task} variant="compact" />
    </button>
  );

  const sortedTickets = useMemo(() => {
    return [...tickets].sort((a, b) => {
      const scoreA = getWorkUnitPriority(a.workUnitId)?.score ?? 0;
      const scoreB = getWorkUnitPriority(b.workUnitId)?.score ?? 0;
      if (scoreB !== scoreA) return scoreB - scoreA;
      return a.scheduledDay.localeCompare(b.scheduledDay);
    });
  }, [tickets, getWorkUnitPriority]);

  if (tickets.length === 0 && unscheduledWorkUnits.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No work units yet. Scaffold tasks from an experiment or reset prototype data.
      </p>
    );
  }

  return (
    <>
      {unscheduledWorkUnits.length > 0 ? (
        <section className="mb-6">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Draft units
          </h3>
          <div className="grid gap-4">
            {unscheduledWorkUnits.map((workUnit) => (
              <WorkUnitCard
                key={workUnit.id}
                workUnit={workUnit}
                renderTask={renderOpenableTask}
              />
            ))}
          </div>
        </section>
      ) : null}

      {sortedTickets.length > 0 ? (
        <section>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Tickets
          </h3>
          <div className="grid gap-4">
            {sortedTickets.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                renderTask={renderOpenableTask}
              />
            ))}
          </div>
        </section>
      ) : null}

      <TaskDetailDialog
        task={selectedTask}
        open={selectedTask !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen) setSelectedTask(null);
        }}
      />
    </>
  );
}
