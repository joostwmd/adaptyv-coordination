import { useState } from "react";

import { PlanningBoard } from "./planning-board";
import { PlanningStats } from "./planning-stats";
import {
  PriorityControlsCollapsible,
  PriorityControlsTrigger,
} from "./priority-controls-panel";
import { NeedsAttentionDrawer } from "./zones/needs-attention-drawer";

export function PlanningScreen() {
  const [priorityOpen, setPriorityOpen] = useState(false);

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden px-3 py-2">
      <PriorityControlsCollapsible
        open={priorityOpen}
        onOpenChange={setPriorityOpen}
        trigger={
          <header className="flex shrink-0 items-center justify-between gap-3 border-b pb-2">
            <div className="min-w-0 space-y-0.5">
              <h1 className="text-sm font-semibold tracking-tight">Lab planning</h1>
              <PlanningStats />
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <PriorityControlsTrigger open={priorityOpen} />
              <NeedsAttentionDrawer />
            </div>
          </header>
        }
      />

      <div className="min-h-0 min-w-0 flex-1 overflow-hidden pt-2">
        <PlanningBoard />
      </div>
    </div>
  );
}
