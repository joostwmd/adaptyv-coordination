import { ClientCard } from "./layouts/card/client-card";
import { NoteCard } from "./layouts/card/note-card";
import { PaperCard } from "./layouts/card/paper-card";
import { PlatformCard } from "./layouts/card/platform-card";
import { SupplierCard } from "./layouts/card/supplier-card";
import { ContextCardCell } from "./context-card-cell";
import type { ContextItem } from "./types";

type ContextCardProps = {
  item: ContextItem;
  onOpen: (item: ContextItem) => void;
};

function renderCardBody(item: ContextItem) {
  switch (item.type) {
    case "platform":
      return <PlatformCard item={item} />;
    case "client":
      return <ClientCard item={item} />;
    case "note":
      return <NoteCard item={item} />;
    case "supplier":
      return <SupplierCard item={item} />;
    case "paper":
      return <PaperCard item={item} />;
  }
}

export function ContextCard({ item, onOpen }: ContextCardProps) {
  return (
    <ContextCardCell item={item} onOpen={() => onOpen(item)}>
      {renderCardBody(item)}
    </ContextCardCell>
  );
}
