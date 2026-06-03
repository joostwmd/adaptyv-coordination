import { refreshAllTaskReadiness } from "@/domain/task/readiness";
import type { Task } from "@/domain/task/types";

import type { WorkUnit } from "./types";

export function attachTasksToWorkUnits(tasks: Task[], workUnits: WorkUnit[]): Task[] {
  const workUnitByTask = new Map<string, string>();
  for (const workUnit of workUnits) {
    for (const taskId of workUnit.taskIds) {
      workUnitByTask.set(taskId, workUnit.id);
    }
  }

  return refreshAllTaskReadiness(
    tasks.map((task) => {
      const workUnitId = workUnitByTask.get(task.id);
      if (workUnitId) {
        return { ...task, workUnitId, readiness: "batched" as const };
      }
      if (task.readiness === "batched" && !workUnitId) {
        const { workUnitId: _removed, ...rest } = task;
        return refreshAllTaskReadiness([{ ...rest, readiness: "ready" }])[0]!;
      }
      return task;
    }),
  );
}
