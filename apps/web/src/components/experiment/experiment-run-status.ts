import type { ExperimentRunStatus } from "@/types";

export function formatExperimentStatus(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " ");
}

export function getExperimentStatusBadgeVariant(
  status: string,
): "default" | "secondary" | "outline" | "destructive" {
  switch (status) {
    case "synced":
      return "outline";
    case "configured":
      return "default";
    default:
      return "secondary";
  }
}

export function formatRunStatus(status: ExperimentRunStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " ");
}

export function getRunStatusBadgeVariant(
  status: ExperimentRunStatus,
): "default" | "secondary" | "outline" | "destructive" {
  switch (status) {
    case "completed":
      return "default";
    case "in_progress":
      return "secondary";
    case "failed":
      return "destructive";
    default:
      return "outline";
  }
}

function formatIsoDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatRunDateRange(run: {
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}): string | null {
  const start = run.startedAt ?? run.createdAt;
  const end = run.completedAt;
  if (!start) return null;
  if (end) {
    return `${formatIsoDate(start)} – ${formatIsoDate(end)}`;
  }
  return `Started ${formatIsoDate(start)}`;
}
