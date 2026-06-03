import { Card, CardContent } from "@adaptyv-coordination/ui/components/card";
import { motion } from "motion/react";
import type { ReactNode } from "react";

import type { Task } from "@/domain/task/types";
import type { Ticket } from "@/domain/ticket/types";
import { useTicketView } from "@/hooks/useTicket";
import { TicketContent } from "@/components/ticket/ticket-content";

import { PriorityIndicator } from "./priority-indicator";

type TicketCardProps = {
  ticket: Ticket;
  defaultExpanded?: boolean;
  onTaskOpen: (task: Task) => void;
  layoutId?: string;
  renderTask?: (task: Task) => ReactNode;
};

export function TicketCard({
  ticket,
  defaultExpanded = false,
  onTaskOpen,
  layoutId,
  renderTask,
}: TicketCardProps) {
  const view = useTicketView(ticket);

  if (!view) return null;

  const card = (
    <Card>
      <CardContent className="pt-6 pb-3">
        <TicketContent
          ticket={ticket}
          assignee={view.assignee}
          showTasks
          defaultTasksOpen={defaultExpanded}
          onTaskOpen={onTaskOpen}
          renderTask={renderTask}
          headerEnd={
            view.priority ? (
              <PriorityIndicator priority={view.priority} context="workUnit" />
            ) : undefined
          }
        />
      </CardContent>
    </Card>
  );

  if (!layoutId) return card;

  return <motion.div layoutId={layoutId}>{card}</motion.div>;
}
