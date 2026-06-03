import { useState } from "react";

import type { Task } from "@/types";

import { TaskCard } from "./task-card";
import { TaskDetailDialog } from "./task-detail-dialog";

type TaskListProps = {
  items: Task[];
};

export function TaskList({ items }: TaskListProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  return (
    <>
      <div className="grid gap-3">
        {items.map((task) => (
          <TaskCard key={task.id} task={task} onOpen={setSelectedTask} />
        ))}
      </div>

      <TaskDetailDialog
        task={selectedTask}
        open={selectedTask !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedTask(null);
          }
        }}
      />
    </>
  );
}
