import { createFileRoute } from "@tanstack/react-router";

import { ExperimentsTable } from "@/components/experiments/experiments-table";

export const Route = createFileRoute("/experiments/")({
  component: ExperimentsIndexPage,
});

function ExperimentsIndexPage() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <ExperimentsTable />
    </div>
  );
}
