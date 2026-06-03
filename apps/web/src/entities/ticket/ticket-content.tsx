import { cn } from "@adaptyv-coordination/ui/lib/utils";
import type { ReactNode } from "react";

import { ContentSection } from "@/shared/layout/content-section";
import { CollapsibleTaskList } from "@/entities/task/collapsible-task-list";
import type { TaskReferenceKey } from "@/entities/task/task-references";
import { WorkUnitContent } from "@/entities/work-unit/work-unit-content";
import type { Ticket } from "@/domain/ticket/types";
import { useTicketView } from "@/hooks/useTicket";
import { useWorkUnit } from "@/hooks/useWorkUnit";
import type { StaffMember, Task } from "@/types";

import { TicketAssignmentRow } from "./ticket-assignment-row";

export type TicketContentProps = {
  ticket: Ticket;
  assignee?: StaffMember | null;
  /** Full work unit block including header (e.g. assignment-only dialog). */
  showWorkUnitSummary?: boolean;
  /** Stats and prep sections without repeating the header (e.g. ticket card). */
  showWorkUnitSections?: boolean;
  showTasks?: boolean;
  defaultTasksOpen?: boolean;
  renderTask?: (task: Task) => ReactNode;
  taskListHide?: TaskReferenceKey[];
  headerEnd?: ReactNode;
  className?: string;
};

export function TicketContent({
  ticket,
  assignee: assigneeProp,
  showWorkUnitSummary = true,
  showWorkUnitSections,
  showTasks = false,
  defaultTasksOpen = false,
  renderTask,
  taskListHide = ["workUnit", "ticket"],
  headerEnd,
  className,
}: TicketContentProps) {
  const view = useTicketView(ticket);
  const workUnit = useWorkUnit(ticket.workUnitId);

  if (!view) return null;

  const assignee = assigneeProp ?? view.assignee;
  const showWorkUnitBody = showWorkUnitSections ?? showWorkUnitSummary;
  const hasWorkUnitBlock = Boolean(workUnit && (showWorkUnitSummary || showWorkUnitBody));

  return (
    <article
      className={cn("flex flex-col", className)}
      aria-label={`Ticket ${ticket.id}`}
    >
      {showWorkUnitSummary && workUnit ? (
        <WorkUnitContent
          workUnit={workUnit}
          variant="default"
          showTasks={false}
          headerEnd={headerEnd}
        />
      ) : showWorkUnitBody && workUnit ? (
        <WorkUnitContent
          workUnit={workUnit}
          variant="default"
          showHeader={false}
          showTasks={false}
        />
      ) : null}

      <ContentSection title="Schedule" divided={hasWorkUnitBlock}>
        <TicketAssignmentRow ticket={ticket} assignee={assignee} />
      </ContentSection>

      {showTasks ? (
        <ContentSection>
          <CollapsibleTaskList
            tasks={view.tasks}
            renderTask={renderTask}
            hide={taskListHide}
            defaultOpen={defaultTasksOpen}
          />
        </ContentSection>
      ) : null}
    </article>
  );
}
