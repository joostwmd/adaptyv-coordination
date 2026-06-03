import { cn } from "@adaptyv-coordination/ui/lib/utils";
import type { ReactNode } from "react";

type MetaRowProps = {
  label: string;
  value: ReactNode;
  className?: string;
};

export function MetaRow({ label, value, className }: MetaRowProps) {
  return (
    <div className={cn("flex gap-2 text-xs/relaxed", className)}>
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="min-w-0">{value}</span>
    </div>
  );
}
