import type { ReactNode } from "react";

import { cn } from "@adaptyv-coordination/ui/lib/utils";

type PlanningSuggestionShellProps = {
  label?: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
};

export function PlanningSuggestionShell({
  label = "Suggested unit",
  action,
  className,
  children,
}: PlanningSuggestionShellProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-md border border-dashed border-muted-foreground/35 bg-muted/15",
        className,
      )}
    >
      <header className="flex items-start justify-between gap-2 border-b border-dashed border-muted-foreground/25 px-3 py-2">
        <p className="pt-0.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        {action ? (
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
            {action}
          </div>
        ) : null}
      </header>
      <div className="space-y-2 p-3">{children}</div>
    </div>
  );
}
