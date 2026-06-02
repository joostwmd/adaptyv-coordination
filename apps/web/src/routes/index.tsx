import { createFileRoute } from "@tanstack/react-router";

import { WorkUnitList } from "@/components/planning";
import { usePlanningTasks, usePlanningWorkUnits } from "@/stores/usePlanningStore";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  const tasks = usePlanningTasks();
  const workUnits = usePlanningWorkUnits();

  return (
    <div className="container mx-auto max-w-3xl px-4 py-2">
      <div className="grid gap-6">
        <section className="rounded-lg border p-4">
          <h2 className="mb-2 font-medium">Lab planning (prototype)</h2>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
            <span className="text-sm text-muted-foreground">
              {tasks.length} tasks · {workUnits.length} work units
            </span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Each card is a work unit (shared assignees, schedule, and notes). Expand to see
            the tasks inside. Priority info is on the badge — hover the icon for details.
          </p>
        </section>

        <section className="rounded-lg border p-4">
          <h2 className="mb-4 font-medium">Work units ({workUnits.length})</h2>
          <WorkUnitList />
        </section>
      </div>
    </div>
  );
}
