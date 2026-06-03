import { Card, CardContent } from "@adaptyv-coordination/ui/components/card";
import { cn } from "@adaptyv-coordination/ui/lib/utils";
import type { ReactNode } from "react";

import type { ExperimentSummary } from "@/types";

import { ExperimentContent } from "./experiment-content";

type ExperimentCardProps = {
  experiment: ExperimentSummary;
  variant?: "default" | "compact";
  headerEnd?: ReactNode;
  className?: string;
  onClick?: () => void;
};

export function ExperimentCard({
  experiment,
  variant = "default",
  headerEnd,
  className,
  onClick,
}: ExperimentCardProps) {
  return (
    <Card
      className={cn(onClick && "cursor-pointer transition-colors hover:bg-muted/30", className)}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <CardContent className={cn(variant === "compact" ? "p-4" : "pt-6")}>
        <div className="flex items-start gap-2">
          <ExperimentContent experiment={experiment} variant={variant} className="min-w-0 flex-1" />
          {headerEnd ? <div className="shrink-0">{headerEnd}</div> : null}
        </div>
      </CardContent>
    </Card>
  );
}
