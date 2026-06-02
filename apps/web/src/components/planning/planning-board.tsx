import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@adaptyv-coordination/ui/components/resizable";

import type { Task } from "@/domain/task/types";

import { PlanningDndProvider } from "./dnd/planning-dnd-provider";
import { DailyKanbanZone } from "./zones/daily-kanban-zone";
import { QueueZone } from "./zones/queue-zone";
import { UnitsZone } from "./zones/units-zone";

type PlanningBoardProps = {
  onTaskOpen: (task: Task) => void;
};

export function PlanningBoard({ onTaskOpen }: PlanningBoardProps) {
  return (
    <PlanningDndProvider onTaskOpen={onTaskOpen}>
      <ResizablePanelGroup
        storageId="planning-main-vertical"
        panelIds={["planning-top", "planning-kanban"]}
        orientation="vertical"
        className="h-full min-h-[420px]"
      >
        <ResizablePanel id="planning-top" defaultSize="52" minSize="28" className="pb-3">
          <ResizablePanelGroup
            storageId="planning-top-row"
            panelIds={["planning-queue", "planning-units"]}
            className="h-full gap-2"
          >
            <ResizablePanel id="planning-queue" defaultSize="45" minSize="25">
              <QueueZone onTaskOpen={onTaskOpen} />
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel id="planning-units" defaultSize="55" minSize="25">
              <UnitsZone onTaskOpen={onTaskOpen} />
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
        <ResizableHandle className="my-1" />
        <ResizablePanel id="planning-kanban" defaultSize="48" minSize="22" className="pt-1">
          <DailyKanbanZone onTaskOpen={onTaskOpen} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </PlanningDndProvider>
  );
}
