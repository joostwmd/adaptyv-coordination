import type { ContextItem } from "./types";

export function getTitle(item: ContextItem): string {
  switch (item.type) {
    case "platform":
    case "note":
    case "paper":
      return item.title;
    case "client":
      return item.title;
    case "supplier":
      return item.materialName;
  }
}

export function getHref(item: ContextItem): string | undefined {
  switch (item.type) {
    case "platform":
    case "client":
    case "paper":
      return item.href;
    case "supplier":
      return item.href;
    case "note":
      return undefined;
  }
}

export function formatAddedAt(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
