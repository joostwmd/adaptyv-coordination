export type ContextCardBase = {
  id: string;
  annotation: string;
  addedBy: string;
  addedAt: string;
};

export type SpecRow = {
  label: string;
  value: string;
};

export type MetricRow = {
  label: string;
  value: string;
};

export type ContextItem =
  | (ContextCardBase & {
      type: "platform";
      recordType: string;
      title: string;
      outcome: string;
      href: string;
      owner: string;
      metrics: MetricRow[];
    })
  | (ContextCardBase & {
      type: "client";
      channel: "slack" | "email";
      clientName: string;
      title: string;
      excerpt: string;
      href: string;
      participants?: string;
      from?: string;
      to?: string;
      attachments?: string[];
    })
  | (ContextCardBase & {
      type: "note";
      title: string;
      bodyPreview: string;
      body: string;
    })
  | (ContextCardBase & {
      type: "supplier";
      supplierName: string;
      materialName: string;
      docType: string;
      specs: SpecRow[];
      href?: string;
    })
  | (ContextCardBase & {
      type: "paper";
      title: string;
      authors: string;
      venue: string;
      year: number;
      abstract: string;
      takeaway?: string;
      href: string;
    });

export type ContextItemType = ContextItem["type"];

export type ExtractContextItem<T extends ContextItemType> = Extract<ContextItem, { type: T }>;
