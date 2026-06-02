import { useMemo, useState } from "react";

import type { Task } from "@/domain/task/types";
import { usePlanningStore, usePlanningWorkUnits } from "@/stores/usePlanningStore";

import { TaskDetailDialog } from "./task-detail-dialog";
import { WorkUnitCard } from "./work-unit-card";

export function WorkUnitList() {
  const workUnits = usePlanningWorkUnits();
  const getWorkUnitPriority = usePlanningStore((s) => s.getWorkUnitPriority);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const sortedWorkUnits = useMemo(() => {
    return [...workUnits].sort((a, b) => {
      const scoreA = getWorkUnitPriority(a.id)?.score ?? 0;
      const scoreB = getWorkUnitPriority(b.id)?.score ?? 0;
      if (scoreB !== scoreA) return scoreB - scoreA;
      return (a.scheduledDay ?? "").localeCompare(b.scheduledDay ?? "");
    });
  }, [workUnits, getWorkUnitPriority]);

  if (workUnits.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No work units yet. Scaffold tasks from an experiment or reset prototype data.
      </p>
    );
  }

  return (
    <>
      <div className="grid gap-4">
        {sortedWorkUnits.map((workUnit) => (
          <WorkUnitCard
            key={workUnit.id}
            workUnit={workUnit}
            onTaskOpen={setSelectedTask}
          />
        ))}
      </div>

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
