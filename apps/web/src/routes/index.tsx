import { createFileRoute } from "@tanstack/react-router";

import { HomeScreen } from "@/components/home";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  return <HomeScreen />;
}
