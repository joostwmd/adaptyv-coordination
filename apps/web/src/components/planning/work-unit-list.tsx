import { useState } from "react";

import type { Task } from "@/domain/task/types";
import { usePlanningWorkUnits } from "@/stores/usePlanningStore";

import { TaskDetailDialog } from "./task-detail-dialog";
import { WorkUnitCard } from "./work-unit-card";

export function WorkUnitList() {
  const workUnits = usePlanningWorkUnits();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

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
        {workUnits.map((workUnit) => (
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
