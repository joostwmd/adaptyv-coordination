import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@adaptyv-coordination/ui/components/hover-card";
import { cn } from "@adaptyv-coordination/ui/lib/utils";
import type { ReactElement } from "react";

import type { ExperimentSummary } from "@/types";

import { ExperimentContent } from "./experiment-content";

type ExperimentHoverCardProps = {
  experiment: ExperimentSummary;
  /** Element rendered as the hover trigger (e.g. Link, button, span). */
  trigger: ReactElement;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  contentClassName?: string;
};

export function ExperimentHoverCard({
  experiment,
  trigger,
  side = "top",
  align = "start",
  contentClassName,
}: ExperimentHoverCardProps) {
  return (
    <HoverCard>
      <HoverCardTrigger render={trigger} />
      <HoverCardContent
        side={side}
        align={align}
        className={cn("w-72 p-3", contentClassName)}
      >
        <ExperimentContent experiment={experiment} />
      </HoverCardContent>
    </HoverCard>
  );
}
