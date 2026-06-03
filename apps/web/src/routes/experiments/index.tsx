import { createFileRoute } from "@tanstack/react-router";

import { ExperimentsTable } from "@/features/experiments";

export const Route = createFileRoute("/experiments/")({
  component: ExperimentsIndexPage,
});

function ExperimentsIndexPage() {
  return (
    <div className="h-full min-h-0 overflow-y-auto">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <ExperimentsTable />
      </div>
    </div>
  );
}
