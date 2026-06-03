import { ContextCardGrid } from "./context-card-grid";
import type { ContextItem } from "./types";

type ContextListProps = {
  items: ContextItem[];
};

/** Single-column layout; prefer {@link ContextCardGrid} for responsive grids. */
export function ContextList({ items }: ContextListProps) {
  return <ContextCardGrid items={items} className="md:grid-cols-1" />;
}
