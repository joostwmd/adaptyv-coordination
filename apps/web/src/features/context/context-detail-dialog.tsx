import { Button } from "@adaptyv-coordination/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@adaptyv-coordination/ui/components/dialog";
import { ExternalLinkIcon } from "lucide-react";

import { ClientDetail } from "./layouts/detail/client-detail";
import { NoteDetail } from "./layouts/detail/note-detail";
import { PaperDetail } from "./layouts/detail/paper-detail";
import { PlatformDetail } from "./layouts/detail/platform-detail";
import { SupplierDetail } from "./layouts/detail/supplier-detail";
import { AnnotationBlock } from "./primitives/annotation-block";
import { SourceBadge } from "./primitives/source-badge";
import type { ContextItem } from "./types";
import { formatAddedAt, getHref, getTitle } from "./utils";

type ContextDetailDialogProps = {
  item: ContextItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function renderDetailBody(item: ContextItem) {
  switch (item.type) {
    case "platform":
      return <PlatformDetail item={item} />;
    case "client":
      return <ClientDetail item={item} />;
    case "note":
      return <NoteDetail item={item} />;
    case "supplier":
      return <SupplierDetail item={item} />;
    case "paper":
      return <PaperDetail item={item} />;
  }
}

export function ContextDetailDialog({ item, open, onOpenChange }: ContextDetailDialogProps) {
  const href = item ? getHref(item) : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {item ? (
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <div className="flex flex-wrap items-center gap-2 pr-6">
              <SourceBadge type={item.type} />
              <span className="text-xs text-muted-foreground">
                {formatAddedAt(item.addedAt)} · {item.addedBy}
              </span>
            </div>
            <DialogTitle>{getTitle(item)}</DialogTitle>
          </DialogHeader>

          <AnnotationBlock text={item.annotation} />

          {renderDetailBody(item)}

          {href ? (
            <DialogFooter>
              <Button variant="outline" render={<a href={href} target="_blank" rel="noreferrer" />}>
                Open source
                <ExternalLinkIcon />
              </Button>
            </DialogFooter>
          ) : null}
        </DialogContent>
      ) : null}
    </Dialog>
  );
}
