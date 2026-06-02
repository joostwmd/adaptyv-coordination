import { RelativeTimeCard } from "@adaptyv-coordination/ui/components/relative-time-card";

type ScheduledTimeProps = {
  scheduledDay?: string;
  className?: string;
};

function parseScheduleDate(day: string): Date {
  return new Date(`${day}T09:00:00`);
}

export function ScheduledTime({ scheduledDay, className }: ScheduledTimeProps) {
  if (!scheduledDay) {
    return <span className={className}>Not scheduled</span>;
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
