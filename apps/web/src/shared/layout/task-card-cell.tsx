import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@adaptyv-coordination/ui/components/card";
import { cn } from "@adaptyv-coordination/ui/lib/utils";
import type { ReactNode } from "react";

type TaskCardCellProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  /** Badges above the title (readiness, type). */
  headerStart?: ReactNode;
  /** Right side of the title row (e.g. priority). */
  headerEnd?: ReactNode;
  children: ReactNode;
  variant?: "standalone" | "compact";
};

export function TaskCardCell({
  title,
  subtitle,
  headerStart,
  headerEnd,
  children,
  variant = "standalone",
}: TaskCardCellProps) {
  const isCompact = variant === "compact";

  return (
    <Card
      className={cn(
        isCompact && "border-border/60 bg-muted/20 shadow-none",
      )}
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
              <div className="text-xs text-muted-foreground leading-snug">{subtitle}</div>
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
    </Card>
  );
}
