import {
  Card,
  CardContent,
  CardHeader,
} from "@adaptyv-coordination/ui/components/card";
import { motion } from "motion/react";
import type { ReactNode } from "react";

import type { Task } from "@/domain/task/types";
import type { Ticket } from "@/domain/ticket/types";
import { useTicketView } from "@/hooks/useTicket";
import { useWorkUnit } from "@/hooks/useWorkUnit";
import { TicketContent } from "@/entities/ticket/ticket-content";
import { WorkUnitContentHeader } from "@/entities/work-unit/work-unit-content-header";
import { useWorkUnitView } from "@/hooks/useWorkUnit";

import { PriorityIndicator } from "@/shared/badges/priority-indicator";

type TicketCardProps = {
  ticket: Ticket;
  defaultExpanded?: boolean;
  layoutId?: string;
  renderTask?: (task: Task) => ReactNode;
};

export function TicketCard({
  ticket,
  defaultExpanded = false,
  layoutId,
  renderTask,
}: TicketCardProps) {
  const view = useTicketView(ticket);
  const workUnit = useWorkUnit(ticket.workUnitId);
  const workUnitView = useWorkUnitView(workUnit);

  if (!view || !workUnit || !workUnitView) return null;

  const headerEnd = view.priority ? (
    <PriorityIndicator priority={view.priority} context="workUnit" />
  ) : null;

  const card = (
    <Card className="overflow-hidden">
      <CardHeader className="space-y-0 border-b border-border/50 px-4 pb-3 pt-6">
        <WorkUnitContentHeader
          workUnit={workUnit}
          view={workUnitView}
          headerEnd={headerEnd}
        />
      </CardHeader>

      <CardContent className="px-4 pb-4 pt-0">
        <TicketContent
          ticket={ticket}
          assignee={view.assignee}
          showWorkUnitSummary={false}
          showWorkUnitSections
          showTasks
          defaultTasksOpen={defaultExpanded}
          renderTask={renderTask}
        />
      </CardContent>
    </Card>
  );

  if (!layoutId) return card;

  return <motion.div layoutId={layoutId}>{card}</motion.div>;
}
