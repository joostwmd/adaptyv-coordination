import { useMemo, useState } from "react";

import type { Task } from "@/domain/task/types";
import {
  usePlanningStore,
  usePlanningTasks,
  usePlanningTickets,
  usePlanningWorkUnits,
} from "@/stores/usePlanningStore";

import { PlanningBoard } from "./planning-board";
import { TaskDetailDialog } from "./task-detail-dialog";
import { BlockedFailedDrawer } from "./zones/blocked-failed-drawer";

function PlanningStats() {
  const tasks = usePlanningTasks();
  const workUnits = usePlanningWorkUnits();
  const tickets = usePlanningTickets();
  const unscheduledCount = usePlanningStore((s) => s.getUnscheduledWorkUnits().length);

  const counts = useMemo(() => {
    const byReadiness: Record<string, number> = {};
    for (const task of tasks) {
      byReadiness[task.readiness] = (byReadiness[task.readiness] ?? 0) + 1;
    }
    return byReadiness;
  }, [tasks]);

  return (
    <p className="text-[11px] text-muted-foreground">
      <span className="font-medium text-foreground">{tasks.length}</span> tasks
      <span aria-hidden> · </span>
      <span className="font-medium text-foreground">{workUnits.length}</span> units
      {unscheduledCount > 0 ? ` (${unscheduledCount} open)` : null}
      <span aria-hidden> · </span>
      <span className="font-medium text-foreground">{tickets.length}</span> tickets
      <span aria-hidden> · </span>
      {counts.ready ?? 0} ready
      <span aria-hidden> · </span>
      {counts.batched ?? 0} batched
      <span aria-hidden> · </span>
      {counts.waiting_upstream ?? 0} waiting
      <span aria-hidden> · </span>
      {counts.in_labos ?? 0} in LabOS
    </p>
  );
}

export function PlanningScreen() {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden px-3 py-2">
      <header className="mb-2 flex shrink-0 items-center justify-between gap-3 border-b pb-2">
        <div className="min-w-0 space-y-0.5">
          <h1 className="text-sm font-semibold tracking-tight">Lab planning</h1>
          <PlanningStats />
        </div>
        <BlockedFailedDrawer onTaskOpen={setSelectedTask} />
      </header>

      <div className="min-h-0 min-w-0 flex-1 overflow-hidden">
        <PlanningBoard onTaskOpen={setSelectedTask} />
      </div>

      <TaskDetailDialog
        task={selectedTask}
        open={selectedTask !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen) setSelectedTask(null);
        }}
      />
    </div>
  );
}
