import { useState } from "react";

import { Button } from "@adaptyv-coordination/ui/components/button";
import { Calendar } from "@adaptyv-coordination/ui/components/calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@adaptyv-coordination/ui/components/dropdown-menu";
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import {
  formatPlanningDayLabel,
  getPlanningDayBounds,
  parsePlanningDay,
  toPlanningDayString,
} from "@/domain/planning/planning-dates";
import { usePlanningStore } from "@/stores/usePlanningStore";

type DateStepperProps = {
  currentDay: string;
};

export function DateStepper({ currentDay }: DateStepperProps) {
  const storeStepPlanningDay = usePlanningStore((state) => state.stepPlanningDay);
  const setCurrentDay = usePlanningStore((state) => state.setCurrentDay);
  const [open, setOpen] = useState(false);

  const { minDate, maxDate, minDay, maxDay } = getPlanningDayBounds();
  const selectedDate = parsePlanningDay(currentDay);
  const atStart = currentDay <= minDay;
  const atEnd = currentDay >= maxDay;

  return (
    <div className="flex items-center gap-1">
      <Button
        type="button"
        variant="outline"
        size="icon-xs"
        disabled={atStart}
        onClick={() => storeStepPlanningDay(-1)}
        aria-label="Previous day"
      >
        <ChevronLeftIcon />
      </Button>

      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 min-w-[9.5rem] justify-start gap-1.5 px-2 text-xs font-normal"
            />
          }
        >
          <CalendarIcon className="size-3.5 text-muted-foreground" />
          {formatPlanningDayLabel(currentDay)}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="w-auto p-0">
          <Calendar
            mode="single"
            selected={selectedDate}
            defaultMonth={selectedDate}
            startMonth={minDate}
            endMonth={maxDate}
            disabled={{ before: minDate, after: maxDate }}
            onSelect={(date) => {
              if (!date) return;
              setCurrentDay(toPlanningDayString(date));
              setOpen(false);
            }}
          />
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        type="button"
        variant="outline"
        size="icon-xs"
        disabled={atEnd}
        onClick={() => storeStepPlanningDay(1)}
        aria-label="Next day"
      >
        <ChevronRightIcon />
      </Button>
    </div>
  );
}
