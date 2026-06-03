import type { Task } from "@/types";

import { TaskCard } from "./task-card";

type TaskListProps = {
  items: Task[];
};

export function TaskList({ items }: TaskListProps) {
  return (
    <div className="grid gap-3">
      {items.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  );
}
