import {
  Status,
  StatusIndicator,
  StatusLabel,
} from "@adaptyv-coordination/ui/components/status";

import type { TicketExecutionStatus } from "@/domain/tickets/execution-status";

const STATUS_CONFIG: Record<
  TicketExecutionStatus,
  {
    variant: "default" | "success" | "error" | "warning" | "info";
    label: string;
  }
> = {
  not_started: { variant: "default", label: "Not started" },
  started: { variant: "info", label: "Started" },
  done: { variant: "success", label: "Done" },
  failed: { variant: "error", label: "Failed" },
};

type TicketExecutionStatusBadgeProps = {
  status: TicketExecutionStatus;
};

export function TicketExecutionStatusBadge({
  status,
}: TicketExecutionStatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <Status variant={config.variant}>
      <StatusIndicator />
      <StatusLabel>{config.label}</StatusLabel>
    </Status>
  );
}
