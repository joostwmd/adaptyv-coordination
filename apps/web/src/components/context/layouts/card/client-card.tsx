import { Badge } from "@adaptyv-coordination/ui/components/badge";

import { CLIENT_CHANNEL_LABEL } from "../../constants";
import { MetaRow } from "../../primitives/meta-row";
import type { ExtractContextItem } from "../../types";

type ClientCardProps = {
  item: ExtractContextItem<"client">;
};

export function ClientCard({ item }: ClientCardProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary">{CLIENT_CHANNEL_LABEL[item.channel]}</Badge>
        <span className="text-xs text-muted-foreground">{item.clientName}</span>
      </div>
      {item.channel === "slack" ? (
        <MetaRow label="Channel" value={item.title} />
      ) : (
        <MetaRow label="Subject" value={item.title} />
      )}
      <p className="line-clamp-2 text-xs/relaxed text-muted-foreground">{item.excerpt}</p>
    </div>
  );
}
