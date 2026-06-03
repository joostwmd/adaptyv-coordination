import type { ReactNode } from "react";

import { cn } from "@adaptyv-coordination/ui/lib/utils";

type PlanningSuggestionShellProps = {
  label?: ReactNode;
  action?: ReactNode;
  /** Split: label and actions on one row. Stacked: status/label then actions (fits wide button groups). */
  headerLayout?: "split" | "stacked";
  className?: string;
  children: ReactNode;
};

export function PlanningSuggestionShell({
  label = "Suggested unit",
  action,
  headerLayout = "split",
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
      <header
        className={cn(
          "gap-2 border-b border-dashed border-muted-foreground/25 px-3 py-2.5",
          headerLayout === "stacked"
            ? "flex flex-col"
            : "flex items-start justify-between",
        )}
      >
        {typeof label === "string" ? (
          <p className="pt-0.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
        ) : (
          <div className="flex min-w-0 items-center">{label}</div>
        )}
        {action ? (
          <div
            className={cn(
              "flex flex-wrap items-center gap-1.5",
              headerLayout === "stacked" ? "w-full" : "shrink-0 justify-end",
            )}
          >
            {action}
          </div>
        ) : null}
      </header>
      <div className="space-y-2 p-3">{children}</div>
    </div>
  );
}
