import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@adaptyv-coordination/ui/components/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@adaptyv-coordination/ui/components/collapsible";
import { cn } from "@adaptyv-coordination/ui/lib/utils";
import { ChevronDownIcon } from "lucide-react";
import { motion } from "motion/react";

import type { Task } from "@/domain/task/types";
import type { Ticket } from "@/domain/ticket/types";
import { useTicketView } from "@/hooks/useTicket";

import { PriorityIndicator } from "./priority-indicator";
import { AssigneesRow } from "./primitives/assignees-row";
import { ScheduledTime } from "./primitives/scheduled-time";
import { TaskCard } from "./task-card";

type TicketCardProps = {
  ticket: Ticket;
  defaultExpanded?: boolean;
  onTaskOpen: (task: Task) => void;
  layoutId?: string;
};

export function TicketCard({
  ticket,
  defaultExpanded = false,
  onTaskOpen,
  layoutId,
}: TicketCardProps) {
  const [open, setOpen] = useState(defaultExpanded);
  const view = useTicketView(ticket);

  if (!view) return null;

  const assignees = view.assignee ? [view.assignee] : [];

  const card = (
    <Card>
      <CardHeader className="gap-2 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1 space-y-2">
            <CardTitle className="text-base leading-snug">{view.templateLabel}</CardTitle>
            <p className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-muted-foreground">
              <span>
                {view.experimentCount} experiment
                {view.experimentCount === 1 ? "" : "s"}
              </span>
              <span aria-hidden>·</span>
              <ScheduledTime
                scheduledDay={ticket.scheduledDay}
                display="date"
                className="text-xs text-muted-foreground"
              />
            </p>
            <AssigneesRow assignees={assignees} />
          </div>
          {view.priority ? (
            <PriorityIndicator priority={view.priority} context="workUnit" />
          ) : null}
        </div>
      </CardHeader>

      <CardContent className="pt-0 pb-3">
        <motion.div layoutRoot>
          <Collapsible open={open} onOpenChange={setOpen}>
          <CollapsibleTrigger
            className={cn(
              "flex w-full items-center justify-between rounded-md border bg-muted/30 px-3 py-2.5 text-xs font-medium",
              "hover:bg-muted/50 transition-colors",
            )}
          >
            <span>
              {open ? "Hide" : "Show"} {view.tasks.length} task
              {view.tasks.length === 1 ? "" : "s"}
            </span>
            <ChevronDownIcon
              className={cn("size-4 shrink-0 transition-transform", open && "rotate-180")}
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 flex flex-col gap-2">
            {view.enrichedTasks.map(({ task }) => (
              <TaskCard
                key={task.id}
                task={task}
                onOpen={onTaskOpen}
                variant="compact"
                layoutId={`task-${task.id}`}
              />
            ))}
          </CollapsibleContent>
        </Collapsible>
        </motion.div>
      </CardContent>
    </Card>
  );

  if (!layoutId) return card;

  return (
    <motion.div layoutId={layoutId}>
      {card}
    </motion.div>
  );
}
