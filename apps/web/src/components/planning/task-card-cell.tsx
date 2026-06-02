import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@adaptyv-coordination/ui/components/card";
import { cn } from "@adaptyv-coordination/ui/lib/utils";
import type { KeyboardEvent, ReactNode } from "react";

type TaskCardCellProps = {
  title: string;
  subtitle?: string;
  /** Badges above the title (readiness, type). */
  headerStart?: ReactNode;
  /** Right side of the title row (e.g. priority). */
  headerEnd?: ReactNode;
  onOpen: () => void;
  children: ReactNode;
  variant?: "standalone" | "compact";
  footerLabel?: string;
};

export function TaskCardCell({
  title,
  subtitle,
  headerStart,
  headerEnd,
  onOpen,
  children,
  variant = "standalone",
  footerLabel = "View full task",
}: TaskCardCellProps) {
  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onOpen();
    }
  }

  const isCompact = variant === "compact";

  return (
    <Card
      className={cn(
        "cursor-pointer transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        isCompact && "border-border/60 bg-muted/20 shadow-none",
      )}
      onClick={onOpen}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      <CardHeader className={cn(isCompact ? "px-3 py-3" : "pb-3")}>
        {headerStart ? (
          <div className="mb-1.5 flex flex-wrap items-center gap-1.5">{headerStart}</div>
        ) : null}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1 space-y-0.5">
            <CardTitle className={cn(isCompact ? "text-sm leading-snug" : "text-base")}>
              {title}
            </CardTitle>
            {subtitle ? (
              <p className="text-xs text-muted-foreground leading-snug">{subtitle}</p>
            ) : null}
          </div>
          {headerEnd ? <div className="shrink-0">{headerEnd}</div> : null}
        </div>
      </CardHeader>

      {children ? (
        <CardContent
          className={cn(
            "border-t border-border/50 pt-3",
            isCompact ? "px-3 pb-3" : "pb-4",
          )}
        >
          {children}
        </CardContent>
      ) : null}

      {!isCompact ? (
        <CardFooter className="border-t border-border/50 py-2 text-xs text-muted-foreground">
          {footerLabel}
        </CardFooter>
      ) : null}
    </Card>
  );
}
