import { RelativeTimeCard } from "@adaptyv-coordination/ui/components/relative-time-card";
import { cn } from "@adaptyv-coordination/ui/lib/utils";

import { formatPlanningDayLabel } from "@/domain/planning/planning-dates";

type ScheduledTimeProps = {
  scheduledDay?: string;
  className?: string;
  /** Date only on kanban cards; full date + time elsewhere. */
  display?: "date" | "datetime";
};

function parseScheduleDate(day: string): Date {
  return new Date(`${day}T12:00:00`);
}

export function ScheduledTime({
  scheduledDay,
  className,
  display = "datetime",
}: ScheduledTimeProps) {
  if (!scheduledDay) {
    return <span className={className}>Not scheduled</span>;
  }

  if (display === "date") {
    return (
      <time dateTime={scheduledDay} className={cn("whitespace-nowrap", className)}>
        {formatPlanningDayLabel(scheduledDay)}
      </time>
    );
  }

  return (
    <RelativeTimeCard
      date={parseScheduleDate(scheduledDay)}
      variant="ghost"
      className={className}
      updateInterval={60_000}
    />
  );
}
