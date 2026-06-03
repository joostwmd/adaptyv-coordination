import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@adaptyv-coordination/ui/components/card";
import { cn } from "@adaptyv-coordination/ui/lib/utils";
import type { KeyboardEvent, ReactNode } from "react";

import { AnnotationBlock } from "./primitives/annotation-block";
import { SourceBadge } from "./primitives/source-badge";
import type { ContextItem } from "./types";
import { formatAddedAt, getTitle } from "./utils";

type ContextCardCellProps = {
  item: ContextItem;
  onOpen: () => void;
  children: ReactNode;
};

export function ContextCardCell({ item, onOpen, children }: ContextCardCellProps) {
  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onOpen();
    }
  }

  return (
    <Card
      className={cn(
        "h-full cursor-pointer transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
      )}
      onClick={onOpen}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      <CardHeader className="shrink-0">
        <div className="flex flex-wrap items-center gap-2">
          <SourceBadge type={item.type} />
          <span className="text-xs text-muted-foreground">
            {formatAddedAt(item.addedAt)} · {item.addedBy}
          </span>
        </div>
        <CardTitle>{getTitle(item)}</CardTitle>
      </CardHeader>

      <CardContent className="flex min-h-0 flex-1 flex-col gap-3">
        <AnnotationBlock text={item.annotation} />
        {children}
      </CardContent>

      <CardFooter className="h-10 shrink-0 items-center px-4 py-0 text-xs text-muted-foreground">
        View details
      </CardFooter>
    </Card>
  );
}
