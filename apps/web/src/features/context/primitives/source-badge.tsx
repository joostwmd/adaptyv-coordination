import { Badge } from "@adaptyv-coordination/ui/components/badge";

import { SOURCE_CONFIG } from "../constants";
import type { ContextItemType } from "../types";

type SourceBadgeProps = {
  type: ContextItemType;
  className?: string;
};

export function SourceBadge({ type, className }: SourceBadgeProps) {
  const { label, icon: Icon } = SOURCE_CONFIG[type];

  return (
    <Badge variant="outline" className={className}>
      <Icon />
      {label}
    </Badge>
  );
}
