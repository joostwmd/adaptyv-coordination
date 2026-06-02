import { createFileRoute } from "@tanstack/react-router";

import { ContextList } from "@/components/context";
import { TaskList } from "@/components/task";
import { useContextItems } from "@/hooks/useContextItems";
import { useTasks } from "@/hooks/useTasks";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});


function HomeComponent() {
  const { contextItems } = useContextItems();
  const { tasks } = useTasks();

  return (
    <div className="container mx-auto max-w-3xl px-4 py-2">
      <div className="grid gap-6">
        <section className="rounded-lg border p-4">
          <h2 className="mb-2 font-medium">Prototype Mode</h2>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm text-muted-foreground">
              Using in-memory data store
            </span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Data resets on page reload. Use the prototype controls in the bottom right to reset data manually.
          </p>
        </section>
        <section className="rounded-lg border p-4">
          <h2 className="mb-4 font-medium">
            Experiment context ({contextItems.length})
          </h2>
          <ContextList items={contextItems} />
        </section>
        <section className="rounded-lg border p-4">
          <h2 className="mb-4 font-medium">
            Tasks ({tasks.length})
          </h2>
          <TaskList items={tasks} />
        </section>
      </div>
    </div>
  );
}
