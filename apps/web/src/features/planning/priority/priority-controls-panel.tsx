import { Button } from "@adaptyv-coordination/ui/components/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@adaptyv-coordination/ui/components/collapsible";
import { Input } from "@adaptyv-coordination/ui/components/input";
import { cn } from "@adaptyv-coordination/ui/lib/utils";
import { ChevronDownIcon, SlidersHorizontalIcon } from "lucide-react";
import type { ReactNode } from "react";

import {
  detectActivePreset,
  PRIORITY_DIMENSION_META,
  PRIORITY_PRESET_LABELS,
  sumPriorityWeights,
  type PriorityPresetName,
} from "@/domain/priority";
import {
  usePlanningPreferencesStore,
  usePlanningWeights,
} from "@/stores/planning/usePlanningPreferencesStore";

import { PriorityFactorsDialog } from "./priority-factors-dialog";
import { PriorityFormulaCompact } from "./priority-formula-display";

const PRESET_ORDER: PriorityPresetName[] = ["default", "deadline", "throughput"];

type PriorityControlsCollapsibleProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: ReactNode;
};

export function PriorityControlsTrigger({ open }: { open: boolean }) {
  return (
    <CollapsibleTrigger
      render={<Button type="button" size="sm" variant="outline" className="gap-1.5" />}
    >
      <SlidersHorizontalIcon className="size-3.5" />
      Priority
      <ChevronDownIcon
        className={cn("size-3.5 transition-transform", open && "rotate-180")}
      />
    </CollapsibleTrigger>
  );
}

function PriorityControlsContent() {
  const weights = usePlanningWeights();
  const applyWeightPreset = usePlanningPreferencesStore((state) => state.applyWeightPreset);
  const updateWeight = usePlanningPreferencesStore((state) => state.updateWeight);
  const activePreset = detectActivePreset(weights);
  const weightSum = sumPriorityWeights(weights);

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
        <div className="flex flex-wrap items-center gap-1">
          {PRESET_ORDER.map((preset) => (
            <Button
              key={preset}
              type="button"
              size="xs"
              variant={activePreset === preset ? "default" : "outline"}
              onClick={() => applyWeightPreset(preset)}
            >
              {PRIORITY_PRESET_LABELS[preset]}
            </Button>
          ))}
          {activePreset === "custom" ? (
            <span className="px-1 text-[10px] text-muted-foreground">Custom</span>
          ) : null}
        </div>
        <div className="hidden h-4 w-px bg-border sm:block" aria-hidden />
        <PriorityFactorsDialog />
      </div>

      <div className="flex items-center gap-2 rounded-md border bg-background/60 px-2 py-1.5">
        <PriorityFormulaCompact weights={weights} />
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          Factor weights
        </span>
        <span className="text-[10px] tabular-nums text-muted-foreground">
          Total {weightSum.toFixed(2)}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 sm:grid-cols-3 lg:grid-cols-4">
        {PRIORITY_DIMENSION_META.map(({ key, label }) => (
          <label
            key={key}
            className="grid grid-cols-[minmax(0,1fr)_4.75rem] items-center gap-2"
          >
            <span className="truncate text-[11px] text-foreground" title={label}>
              {label}
            </span>
            <Input
              type="number"
              min={0}
              max={1}
              step={0.05}
              value={weights[key]}
              onChange={(event) => {
                const parsed = Number.parseFloat(event.target.value);
                if (Number.isNaN(parsed)) return;
                updateWeight(key, parsed);
              }}
              className="h-7 min-w-[4.75rem] px-2 text-center text-xs tabular-nums"
            />
          </label>
        ))}
      </div>
    </div>
  );
}

export function PriorityControlsCollapsible({
  open,
  onOpenChange,
  trigger,
}: PriorityControlsCollapsibleProps) {
  return (
    <Collapsible open={open} onOpenChange={onOpenChange}>
      {trigger}
      <CollapsibleContent className="border-b bg-muted/10 px-0 py-2 data-[state=closed]:hidden">
        <PriorityControlsContent />
      </CollapsibleContent>
    </Collapsible>
  );
}
