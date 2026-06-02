import type { ReactNode } from "react";
import { useDroppable } from "@dnd-kit/react";
import { cn } from "@adaptyv-coordination/ui/lib/utils";

import type { ZoneDropData, ZoneDropKind } from "./types";

type ZoneDropTargetProps = {
  zone: ZoneDropKind;
  accept: (source: { type?: string | number | symbol }) => boolean;
  children: ReactNode;
  className?: string;
  activeHint?: string;
};

export function ZoneDropTarget({
  zone,
  accept,
  children,
  className,
  activeHint,
}: ZoneDropTargetProps) {
  const { ref, isDropTarget } = useDroppable({
    id: `zone:${zone}`,
    accept,
    data: { kind: zone } satisfies ZoneDropData,
  });

  return (
    <div
      ref={ref}
      className={cn(
        "min-h-[8rem] rounded-md transition-colors",
        isDropTarget && "bg-primary/5 ring-2 ring-inset ring-primary/30",
        className,
      )}
    >
      {children}
      {isDropTarget && activeHint ? (
        <p className="px-3 pb-3 text-center text-xs font-medium text-primary">{activeHint}</p>
      ) : null}
    </div>
  );
}
