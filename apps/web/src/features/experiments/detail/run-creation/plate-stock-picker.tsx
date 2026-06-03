import { useMemo, useState } from "react";

import { Button } from "@adaptyv-coordination/ui/components/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@adaptyv-coordination/ui/components/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@adaptyv-coordination/ui/components/popover";
import { cn } from "@adaptyv-coordination/ui/lib/utils";
import { ChevronsUpDown } from "lucide-react";

import { getPlateStocksByType, getPlateType } from "@/domain/plate/catalog";
import type { PlateStock } from "@/domain/plate/types";

type PlateStockPickerProps = {
  plateTypeId: string;
  value?: string;
  onValueChange: (stockId: string | undefined) => void;
  className?: string;
};

function stockSearchValue(stock: PlateStock): string {
  return [stock.code, stock.description, stock.materialStockId]
    .filter(Boolean)
    .join(" ");
}

export function PlateStockPicker({
  plateTypeId,
  value,
  onValueChange,
  className,
}: PlateStockPickerProps) {
  const [open, setOpen] = useState(false);
  const plateType = getPlateType(plateTypeId);
  const stocks = useMemo(
    () => getPlateStocksByType(plateTypeId),
    [plateTypeId],
  );
  const selected = stocks.find((s) => s.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "h-8 w-full justify-between font-normal",
              !selected && "text-muted-foreground",
              className,
            )}
          >
            <span className="truncate">
              {selected
                ? `${selected.code}${selected.description ? ` · ${selected.description}` : ""}`
                : `Search ${plateType?.name ?? "plate"}…`}
            </span>
            <ChevronsUpDown className="ml-2 size-3.5 shrink-0 opacity-50" />
          </Button>
        }
      />
      <PopoverContent className="w-[var(--anchor-width)] min-w-[280px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search by plate code…" />
          <CommandList>
            <CommandEmpty>No plates found.</CommandEmpty>
            <CommandGroup>
              {stocks.map((stock) => (
                <CommandItem
                  key={stock.id}
                  value={stockSearchValue(stock)}
                  onSelect={() => {
                    onValueChange(stock.id === value ? undefined : stock.id);
                    setOpen(false);
                  }}
                >
                  <span className="font-mono text-xs">{stock.code}</span>
                  {stock.description ? (
                    <span className="truncate text-muted-foreground">
                      {stock.description}
                    </span>
                  ) : null}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
