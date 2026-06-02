import { createFileRoute } from "@tanstack/react-router";

import { PlanningScreen } from "@/components/planning/planning-screen";

export const Route = createFileRoute("/planning")({
  component: PlanningRoute,
});

function PlanningRoute() {
  return <PlanningScreen />;
}
