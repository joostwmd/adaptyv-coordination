import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@adaptyv-coordination/ui/components/hover-card";
import { cn } from "@adaptyv-coordination/ui/lib/utils";
import type { ReactElement } from "react";

import type { WorkUnit } from "@/domain/work-unit/types";

import { WorkUnitContent } from "./work-unit-content";

type WorkUnitHoverCardProps = {
  workUnit: WorkUnit;
  trigger: ReactElement;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  contentClassName?: string;
};

export function WorkUnitHoverCard({
  workUnit,
  trigger,
  side = "top",
  align = "start",
  contentClassName,
}: WorkUnitHoverCardProps) {
  return (
    <HoverCard>
      <HoverCardTrigger render={trigger} />
      <HoverCardContent
        side={side}
        align={align}
        className={cn("w-72 p-3", contentClassName)}
      >
        <WorkUnitContent workUnit={workUnit} />
      </HoverCardContent>
    </HoverCard>
  );
}
