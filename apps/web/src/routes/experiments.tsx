import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/experiments")({
  component: ExperimentsLayout,
});

function ExperimentsLayout() {
  return (
    <div className="h-full min-h-0 overflow-y-auto">
      <Outlet />
    </div>
  );
}
