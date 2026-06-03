import { Fragment, useMemo, type ReactNode } from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@adaptyv-coordination/ui/components/tooltip";
import { cn } from "@adaptyv-coordination/ui/lib/utils";

import { formatPlanningDayLabel } from "@/domain/planning/display";
import { usePlanningBoardContext } from "@/components/planning/planning-board-context";
import {
  usePlanningBoardStore,
  usePlanningTasks,
  usePlanningTickets,
  usePlanningWorkUnits,
} from "@/stores/planning/usePlanningBoardStore";

type PlanningStatProps = {
  value: number;
  label: string;
  hint: string;
  className?: string;
};

function PlanningStat({ value, label, hint, className }: PlanningStatProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <span
            className={cn(
              "inline-flex cursor-default items-baseline gap-1 underline decoration-muted-foreground/30 decoration-dotted underline-offset-2",
              className,
            )}
          />
        }
      >
        <span className="font-medium tabular-nums text-foreground">{value}</span>
        <span>{label}</span>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-xs text-xs">
        {hint}
      </TooltipContent>
    </Tooltip>
  );
}

function StatDot() {
  return (
    <span aria-hidden className="text-muted-foreground/35">
      ·
    </span>
  );
}

function StatList({ items }: { items: ReactNode[] }) {
  const visible = items.filter(Boolean);
  if (visible.length === 0) return null;

  return (
    <>
      {visible.map((item, index) => (
        <Fragment key={index}>
          {index > 0 ? <StatDot /> : null}
          {item}
        </Fragment>
      ))}
    </>
  );
}

type StatGroupProps = {
  title: string;
  children: ReactNode;
  className?: string;
};

function StatGroup({ title, children, className }: StatGroupProps) {
  return (
    <div
      className={cn(
        "inline-flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5 rounded-md border border-border/50 bg-muted/20 px-2 py-0.5",
        className,
      )}
    >
      <span
        title={title === "Board" ? "On the board" : title}
        className="shrink-0 text-[10px] font-medium uppercase tracking-wide text-muted-foreground"
      >
        {title}
      </span>
      <StatDot />
      {children}
    </div>
  );
}

export function PlanningStats() {
  const tasks = usePlanningTasks();
  const workUnits = usePlanningWorkUnits();
  const tickets = usePlanningTickets();
  const board = usePlanningBoardContext();
  const currentDay = usePlanningBoardStore((state) => state.currentDay);
  const unscheduledCount = board.unscheduledWorkUnits.length;

  const counts = useMemo(() => {
    const byReadiness: Record<string, number> = {};
    for (const task of tasks) {
      byReadiness[task.readiness] = (byReadiness[task.readiness] ?? 0) + 1;
    }
    return byReadiness;
  }, [tasks]);

  const scheduledToday = useMemo(
    () => tickets.filter((ticket) => ticket.scheduledDay === currentDay).length,
    [tickets, currentDay],
  );

  const dayLabel = formatPlanningDayLabel(currentDay);
  const ready = counts.ready ?? 0;
  const batched = counts.batched ?? 0;
  const waiting = counts.waiting_upstream ?? 0;
  const doneInLabos = counts.in_labos ?? 0;

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
      <StatGroup title="Board">
        <StatList
          items={[
            <PlanningStat
              key="queue"
              value={ready}
              label="in queue"
              hint="Tasks ready to batch or attach. They appear in the Queue column — not in a work unit yet."
            />,
            <PlanningStat
              key="units"
              value={workUnits.length}
              label="work units"
              hint={
                unscheduledCount > 0
                  ? `${unscheduledCount} of ${workUnits.length} work units are not on anyone's day plan yet. The rest are scheduled on the Daily kanban.`
                  : "Grouped tasks ready to schedule. All are on the Daily kanban."
              }
            />,
            <PlanningStat
              key="today"
              value={scheduledToday}
              label={`on ${dayLabel}`}
              hint={
                tickets.length > scheduledToday
                  ? `${scheduledToday} work units assigned on ${dayLabel}. ${tickets.length - scheduledToday} more scheduled on other days.`
                  : `Work units assigned to lab techs on ${dayLabel} (Daily kanban).`
              }
            />,
          ]}
        />
      </StatGroup>

      <StatGroup title="Pipeline">
        <StatList
          items={[
            batched > 0 ? (
              <PlanningStat
                key="grouped"
                value={batched}
                label="grouped"
                hint="Tasks already placed inside a work unit. They leave the queue until the unit is dissolved."
              />
            ) : null,
            waiting > 0 ? (
              <PlanningStat
                key="waiting"
                value={waiting}
                label="waiting"
                hint="Earlier workflow steps must finish in LabOS before these tasks become ready. See Needs attention."
              />
            ) : null,
            <PlanningStat
              key="labos"
              value={doneInLabos}
              label="done in LabOS"
              hint="Steps already completed in LabOS (or marked complete for planning). They are not on this board — they only unlock later tasks."
            />,
          ]}
        />
      </StatGroup>
    </div>
  );
}
