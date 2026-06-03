import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@adaptyv-coordination/ui/components/hover-card";
import { cn } from "@adaptyv-coordination/ui/lib/utils";
import type { ReactElement } from "react";

import type { ExperimentRunSummary, ExperimentSummary } from "@/types";

import { ExperimentRunContent } from "./experiment-run-content";

type ExperimentRunHoverCardProps = {
  run: ExperimentRunSummary;
  experiment: ExperimentSummary;
  trigger: ReactElement;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  contentClassName?: string;
};

export function ExperimentRunHoverCard({
  run,
  experiment,
  trigger,
  side = "top",
  align = "start",
  contentClassName,
}: ExperimentRunHoverCardProps) {
  return (
    <HoverCard>
      <HoverCardTrigger render={trigger} />
      <HoverCardContent
        side={side}
        align={align}
        className={cn("w-72 p-3", contentClassName)}
      >
        <ExperimentRunContent run={run} experiment={experiment} />
      </HoverCardContent>
    </HoverCard>
  );
}
