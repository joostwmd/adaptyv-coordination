import { useState } from "react";

import { ContextCard } from "./context-card";
import { ContextDetailDialog } from "./context-detail-dialog";
import type { ContextItem } from "./types";

type ContextListProps = {
  items: ContextItem[];
};

export function ContextList({ items }: ContextListProps) {
  const [selectedItem, setSelectedItem] = useState<ContextItem | null>(null);

  return (
    <>
      <div className="grid gap-3">
        {items.map((item) => (
          <ContextCard key={item.id} item={item} onOpen={setSelectedItem} />
        ))}
      </div>

      <ContextDetailDialog
        item={selectedItem}
        open={selectedItem !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedItem(null);
          }
        }}
      />
    </>
  );
}
