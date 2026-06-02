import { Badge } from "@adaptyv-coordination/ui/components/badge";

import { CLIENT_CHANNEL_LABEL } from "../../constants";
import { MetaRow } from "../../primitives/meta-row";
import type { ExtractContextItem } from "../../types";

type ClientDetailProps = {
  item: ExtractContextItem<"client">;
};

export function ClientDetail({ item }: ClientDetailProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary">{CLIENT_CHANNEL_LABEL[item.channel]}</Badge>
        <span className="text-xs text-muted-foreground">{item.clientName}</span>
      </div>

      {item.channel === "slack" ? (
        <>
          <MetaRow label="Channel" value={item.title} />
          {item.participants ? <MetaRow label="Participants" value={item.participants} /> : null}
        </>
      ) : (
        <>
          <MetaRow label="Subject" value={item.title} />
          {item.from ? <MetaRow label="From" value={item.from} /> : null}
          {item.to ? <MetaRow label="To" value={item.to} /> : null}
        </>
      )}

      <div>
        <p className="mb-1 text-xs font-medium text-muted-foreground">Message</p>
        <p className="text-xs/relaxed">{item.excerpt}</p>
      </div>

      {item.attachments && item.attachments.length > 0 ? (
        <div>
          <p className="mb-1 text-xs font-medium text-muted-foreground">Attachments</p>
          <ul className="flex flex-col gap-1">
            {item.attachments.map((attachment) => (
              <li key={attachment} className="text-xs/relaxed">
                {attachment}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
