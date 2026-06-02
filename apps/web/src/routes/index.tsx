import { Link, createFileRoute } from "@tanstack/react-router";

import { usePlanningTasks, usePlanningWorkUnits } from "@/stores/usePlanningStore";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  const tasks = usePlanningTasks();
  const workUnits = usePlanningWorkUnits();

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-lg font-semibold tracking-tight">Adaptyv coordination</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Prototype workspace for lab planning and experiment coordination.
      </p>

      <section className="mt-8 rounded-lg border p-4">
        <h2 className="font-medium">Lab planning</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {tasks.length} tasks · {workUnits.length} work units in the current prototype
          dataset.
        </p>
        <Link
          to="/planning"
          className="mt-4 inline-flex text-sm font-medium underline-offset-4 hover:underline"
        >
          Open planning screen
        </Link>
      </section>
    </div>
  );
}
