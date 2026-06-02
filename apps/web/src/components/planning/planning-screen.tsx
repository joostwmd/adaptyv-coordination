import { useMemo } from "react";
import { Link } from "@tanstack/react-router";

import { usePlanningTasks, usePlanningWorkUnits } from "@/stores/usePlanningStore";

import { WorkUnitList } from "./work-unit-list";

function PlanningStats() {
  const tasks = usePlanningTasks();
  const workUnits = usePlanningWorkUnits();

  const counts = useMemo(() => {
    const byReadiness: Record<string, number> = {};
    for (const task of tasks) {
      byReadiness[task.readiness] = (byReadiness[task.readiness] ?? 0) + 1;
    }
    return byReadiness;
  }, [tasks]);

  const draftUnits = workUnits.filter((wu) => wu.status === "draft").length;
  const readyUnits = workUnits.filter((wu) => wu.status === "ready").length;

  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
      <span>
        <span className="font-medium text-foreground">{tasks.length}</span> tasks
      </span>
      <span aria-hidden>·</span>
      <span>
        <span className="font-medium text-foreground">{workUnits.length}</span> work units
        {workUnits.length > 0 ? ` (${draftUnits} draft, ${readyUnits} ready)` : null}
      </span>
      <span aria-hidden>·</span>
      <span>{counts.ready ?? 0} ready</span>
      <span aria-hidden>·</span>
      <span>{counts.batched ?? 0} batched</span>
      <span aria-hidden>·</span>
      <span>{counts.waiting_upstream ?? 0} waiting</span>
      <span aria-hidden>·</span>
      <span>{counts.blocked ?? 0} blocked</span>
      <span aria-hidden>·</span>
      <span>{counts.in_labos ?? 0} in LabOS</span>
    </div>
  );
}

export function PlanningScreen() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-6">
      <header className="mb-6 space-y-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link to="/" className="underline-offset-4 hover:underline">
            Home
          </Link>
          <span aria-hidden>/</span>
          <span className="text-foreground">Planning</span>
        </div>
        <h1 className="text-lg font-semibold tracking-tight">Lab planning</h1>
        <p className="text-sm text-muted-foreground">
          Queue work units, inspect tasks, and review run settings before lab execution.
        </p>
        <PlanningStats />
      </header>

      <section className="rounded-lg border p-4">
        <h2 className="mb-4 text-sm font-medium">Work units</h2>
        <WorkUnitList />
      </section>
    </div>
  );
}
