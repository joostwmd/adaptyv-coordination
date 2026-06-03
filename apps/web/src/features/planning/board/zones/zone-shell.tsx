import type { ReactNode } from "react";

import { cn } from "@adaptyv-coordination/ui/lib/utils";

type ZoneShellProps = {
  title: string;
  description?: string;
  count?: number;
  actions?: ReactNode;
  className?: string;
  children: ReactNode;
};

export function ZoneShell({
  title,
  description,
  count,
  actions,
  className,
  children,
}: ZoneShellProps) {
  return (
    <section
      className={cn(
        "flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded-lg border bg-card/40",
        className,
      )}
    >
      <header className="flex shrink-0 items-start justify-between gap-2 border-b px-3 py-2.5">
        <div className="min-w-0 space-y-0.5">
          <h2 className="text-sm font-medium">{title}</h2>
          {description ? (
            <p className="text-xs text-muted-foreground">{description}</p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {typeof count === "number" ? (
            <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {count}
            </span>
          ) : null}
          {actions}
        </div>
      </header>
      <div className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto p-3">
        {children}
      </div>
    </section>
  );
}

type QueueSubzoneProps = {
  title: string;
  count: number;
  defaultOpen?: boolean;
  children: ReactNode;
};

export function QueueSubzone({
  title,
  count,
  defaultOpen = true,
  children,
}: QueueSubzoneProps) {
  return (
    <details open={defaultOpen} className="rounded-md border bg-background/60">
      <summary className="cursor-pointer list-none px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground [&::-webkit-details-marker]:hidden">
        <span className="flex items-center justify-between gap-2">
          <span>{title}</span>
          <span className="rounded bg-muted px-1.5 py-0.5 text-[10px]">{count}</span>
        </span>
      </summary>
      <div className="space-y-2 border-t px-3 py-2">{children}</div>
    </details>
  );
}
