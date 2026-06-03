import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@adaptyv-coordination/ui/components/collapsible";
import { cn } from "@adaptyv-coordination/ui/lib/utils";
import { ChevronDownIcon } from "lucide-react";
import { useState } from "react";

import { useContextItems } from "@/hooks/useContextItems";

import { ContextCard } from "./context-card";
import { ContextDetailDialog } from "./context-detail-dialog";
import type { ContextItem } from "./types";

type ContextCardGridProps = {
  items?: ContextItem[];
  className?: string;
  emptyMessage?: string;
  collapsible?: boolean;
  defaultOpen?: boolean;
  title?: string;
};

export function ContextCardGrid({
  items: itemsProp,
  className,
  emptyMessage = "No context linked yet.",
  collapsible = false,
  defaultOpen = true,
  title = "Context",
}: ContextCardGridProps) {
  const { contextItems: storeItems } = useContextItems();
  const items = itemsProp ?? storeItems;
  const [selectedItem, setSelectedItem] = useState<ContextItem | null>(null);
  const [open, setOpen] = useState(defaultOpen);
  const count = items.length;

  const gridBody =
    count === 0 ? (
      <p className="text-sm text-muted-foreground">{emptyMessage}</p>
    ) : (
      <div
        className={cn(
          "grid grid-cols-1 items-stretch gap-4 md:grid-cols-2",
          className,
        )}
      >
        {items.map((item) => (
          <ContextCard key={item.id} item={item} onOpen={setSelectedItem} />
        ))}
      </div>
    );

  const content = (
    <>
      {gridBody}
      <ContextDetailDialog
        item={selectedItem}
        open={selectedItem !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setSelectedItem(null);
          }
        }}
      />
    </>
  );

  if (!collapsible) {
    return content;
  }

  return (
    <div className="rounded-lg border p-6">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger
          className={cn(
            "flex w-full items-center gap-3 rounded-md text-left transition-colors",
            "hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          )}
        >
          <h2 className="text-lg font-medium">{title}</h2>
          <span className="text-sm text-muted-foreground">
            {count} item{count === 1 ? "" : "s"}
          </span>
          <ChevronDownIcon
            className={cn(
              "ml-auto size-5 shrink-0 text-muted-foreground transition-transform",
              open && "rotate-180",
            )}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4 overflow-hidden">
          {content}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
