import { createFileRoute } from "@tanstack/react-router";

import { TicketsScreen } from "@/features/tickets";

export const Route = createFileRoute("/tickets")({
  component: TicketsRoute,
});

function TicketsRoute() {
  return <TicketsScreen />;
}
