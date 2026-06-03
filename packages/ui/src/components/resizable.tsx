import {
  Group,
  Panel,
  Separator,
  useDefaultLayout,
} from "react-resizable-panels";

import { cn } from "@adaptyv-coordination/ui/lib/utils";

function usePersistedLayout(storageId: string, panelIds?: string[]) {
  return useDefaultLayout({
    id: storageId,
    panelIds,
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
  });
}

function ResizablePanelGroup({
  className,
  storageId,
  panelIds,
  orientation = "horizontal",
  persistLayout = true,
  defaultLayout: defaultLayoutProp,
  ...props
}: React.ComponentProps<typeof Group> & {
  storageId: string;
  panelIds?: string[];
  /** When false, uses `defaultLayout` only and does not read/write localStorage. */
  persistLayout?: boolean;
  defaultLayout?: React.ComponentProps<typeof Group>["defaultLayout"];
}) {
  const persisted = usePersistedLayout(storageId, panelIds);

  return (
    <Group
      id={storageId}
      orientation={orientation}
      className={cn("flex h-full w-full", className)}
      defaultLayout={
        persistLayout ? persisted.defaultLayout : defaultLayoutProp
      }
      onLayoutChanged={
        persistLayout ? persisted.onLayoutChanged : undefined
      }
      {...props}
    />
  );
}

function ResizablePanel({ className, ...props }: React.ComponentProps<typeof Panel>) {
  return (
    <Panel
      className={cn("flex min-h-0 min-w-0 flex-col", className)}
      {...props}
    />
  );
}

function ResizableHandle({
  className,
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      className={cn(
        "relative shrink-0 bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=horizontal]:after:h-1 data-[orientation=horizontal]:after:w-full data-[orientation=horizontal]:after:-translate-y-1/2 data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px",
        className,
      )}
      {...props}
    />
  );
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
