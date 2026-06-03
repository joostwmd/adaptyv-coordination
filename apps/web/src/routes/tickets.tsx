import { createFileRoute } from "@tanstack/react-router";

import { TicketsScreen } from "@/components/tickets/tickets-screen";

export const Route = createFileRoute("/tickets")({
  component: TicketsRoute,
});

function TicketsRoute() {
  return <TicketsScreen />;
}
