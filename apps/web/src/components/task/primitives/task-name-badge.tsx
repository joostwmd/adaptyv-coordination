import { Badge } from "@adaptyv-coordination/ui/components/badge";
import { cn } from "@adaptyv-coordination/ui/lib/utils";

import { getTaskTemplate } from "@/domain/task-template/catalog";
import type { Task } from "@/types";

type TaskNameBadgeProps = {
  task: Task;
  className?: string;
};

function extractTaskIdentifier(taskName: string, templateName: string): string | null {
  if (!taskName || taskName === templateName) {
    return null;
  }

  // Handle patterns like "Expression Run — ACM-455-122" or "Buffer Prep - 9RDJ"
  const patterns = [
    new RegExp(`^${templateName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*[—-]\\s*(.+)$`),
    new RegExp(`^${templateName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s+(.+)$`),
  ];

  for (const pattern of patterns) {
    const match = taskName.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  // If task name is completely different from template, show the full name
  return taskName;
}

export function TaskNameBadge({ task, className }: TaskNameBadgeProps) {
  const template = getTaskTemplate(task.taskTemplateId);
  const templateName = template?.name ?? "";
  
  // Only show badge if task has a custom name
  if (!task.name) {
    return null;
  }

  const identifier = extractTaskIdentifier(task.name, templateName);
  
  if (!identifier) {
    return null;
  }

  return (
    <Badge
      variant="secondary"
      className={cn("text-[11px] font-mono font-normal", className)}
    >
      {identifier}
    </Badge>
  );
}