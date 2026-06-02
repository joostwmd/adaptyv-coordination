import { CATALOG_OVERRIDES } from "./catalog-overrides";
import { TASK_TEMPLATE_BASES } from "./catalog.generated";
import { mergePlanningMeta } from "./planning-meta";
import type { TaskTemplate } from "./types";

export const TASK_TEMPLATES: TaskTemplate[] = TASK_TEMPLATE_BASES.map((base) => {
  const meta = mergePlanningMeta(base, CATALOG_OVERRIDES[base.id]);
  return { ...base, ...meta };
});

export const TASK_TEMPLATES_BY_ID: Record<string, TaskTemplate> = Object.fromEntries(
  TASK_TEMPLATES.map((t) => [t.id, t]),
);

export function getTaskTemplate(id: string): TaskTemplate | undefined {
  return TASK_TEMPLATES_BY_ID[id];
}

export function requireTaskTemplate(id: string): TaskTemplate {
  const t = getTaskTemplate(id);
  if (!t) {
    throw new Error(`Unknown task template: ${id}`);
  }
  return t;
}
