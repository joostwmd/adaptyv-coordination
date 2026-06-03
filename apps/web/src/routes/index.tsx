import { Link, createFileRoute } from "@tanstack/react-router";

import {
  usePlanningTasks,
  usePlanningTickets,
  usePlanningWorkUnits,
} from "@/stores/usePlanningStore";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  const tasks = usePlanningTasks();
  const workUnits = usePlanningWorkUnits();
  const tickets = usePlanningTickets();

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-lg font-semibold tracking-tight">Adaptyv coordination</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Prototype workspace for lab planning and experiment coordination.
      </p>

      <div className="grid gap-4 md:grid-cols-2 mt-8">
        <section className="rounded-lg border p-4">
          <h2 className="font-medium">Experiments</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage laboratory experiments and experiment runs.
          </p>
          <Link
            to="/experiments"
            className="mt-4 inline-flex text-sm font-medium underline-offset-4 hover:underline"
          >
            View experiments
          </Link>
        </section>

        <section className="rounded-lg border p-4">
          <h2 className="font-medium">Lab planning</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {tasks.length} tasks · {workUnits.length} work units · {tickets.length} tickets in
            the current prototype dataset.
          </p>
          <Link
            to="/planning"
            className="mt-4 inline-flex text-sm font-medium underline-offset-4 hover:underline"
          >
            Open planning screen
          </Link>
        </section>
      </div>
    </div>
  );
}
