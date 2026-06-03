import { createFileRoute } from "@tanstack/react-router";

import { PlanningScreen } from "@/features/planning";

export const Route = createFileRoute("/planning")({
  component: PlanningRoute,
});

function PlanningRoute() {
  return <PlanningScreen />;
}
