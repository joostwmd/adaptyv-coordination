import {
  BookOpen,
  Building2,
  FileText,
  FlaskConical,
  MessageSquare,
  type LucideIcon,
} from "lucide-react";

import type { ContextItemType } from "./types";

export type SourceConfig = {
  label: string;
  icon: LucideIcon;
};

export const SOURCE_CONFIG: Record<ContextItemType, SourceConfig> = {
  platform: {
    label: "Platform history",
    icon: FlaskConical,
  },
  client: {
    label: "Client communication",
    icon: MessageSquare,
  },
  note: {
    label: "Manual note",
    icon: FileText,
  },
  supplier: {
    label: "Supplier material",
    icon: Building2,
  },
  paper: {
    label: "Academic paper",
    icon: BookOpen,
  },
};

export const CLIENT_CHANNEL_LABEL = {
  slack: "Slack",
  email: "Email",
} as const;
