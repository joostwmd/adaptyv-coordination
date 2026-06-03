import { Badge } from "@adaptyv-coordination/ui/components/badge";
import { cn } from "@adaptyv-coordination/ui/lib/utils";

type TaskTypeBadgeProps = {
  label: string;
  className?: string;
};

export function TaskTypeBadge({ label, className }: TaskTypeBadgeProps) {
  return (
    <Badge variant="secondary" className={cn("text-xs font-medium", className)}>
      {label}
    </Badge>
  );
}
