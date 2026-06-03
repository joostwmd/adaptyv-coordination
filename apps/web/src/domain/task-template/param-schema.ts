import type { ParamField, ParamSchema } from "./types";

/** @deprecated Use planning param filters; kept for imports that only excluded notes. */
export const RUN_PARAM_UI_EXCLUDED = new Set(["notes"]);

/** Lab-runner fields hidden from planning Run settings (artifacts, traceability, layout). */
const PLANNING_PARAM_EXCLUDED_NAMES = new Set([
  "notes",
  "raw_data_file",
  "probe_lot",
  "CFE Batch",
  "chip_id",
  "kit_size",
  "kit_type",
  "materials_plate",
  "standards_plate",
  "overhead",
  "n",
  "plates_count",
  "target_concentration",
  "property_1",
  "property_2",
  "property_3",
]);

function isVolumeOrLayoutField(name: string): boolean {
  if (name === "volume" || name === "well_volume") return true;
  if (name.endsWith("_volume") || name.endsWith("_volumes")) return true;
  if (name.startsWith("temp_range_")) return true;
  return false;
}

function isStockOrPlateRefField(name: string): boolean {
  return name.endsWith("_stocks") || name.endsWith("_plate");
}

/** Whether a schema field should appear in planning Run settings UI. */
export function isPlanningRelevantParamField(field: ParamField): boolean {
  if (PLANNING_PARAM_EXCLUDED_NAMES.has(field.name)) return false;
  if (field.type === "array") return false;
  if (isVolumeOrLayoutField(field.name)) return false;
  if (isStockOrPlateRefField(field.name)) return false;
  return true;
}

export function getDisplayParamFields(schema: ParamSchema): ParamField[] {
  return schema.fields.filter(isPlanningRelevantParamField);
}

/** Fields to render: planning-relevant and either set or required-but-missing. */
export function getPlanningParamFieldsForDisplay(
  schema: ParamSchema,
  params: Record<string, unknown>,
): ParamField[] {
  return getDisplayParamFields(schema).filter((field) => {
    if (field.required && !paramFieldHasValue(params[field.name])) return true;
    return paramFieldHasValue(params[field.name]);
  });
}

export function formatParamValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) {
    if (value.length === 0) return "—";
    return value.length === 1 ? formatParamValue(value[0]) : `${value.length} items`;
  }
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export function paramFieldHasValue(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

export function getSummaryParamFields(
  schema: ParamSchema,
  params: Record<string, unknown>,
  maxFields: number,
): ParamField[] {
  return getDisplayParamFields(schema)
    .filter((f) => paramFieldHasValue(params[f.name]))
    .slice(0, maxFields);
}

export function getDefaultParams(schema: ParamSchema): Record<string, unknown> {
  const params: Record<string, unknown> = {};
  for (const field of schema.fields) {
    if (field.default !== undefined) {
      params[field.name] = field.default;
    } else if (field.type === "array") {
      params[field.name] = [];
    } else if (field.type === "string") {
      params[field.name] = "";
    } else if (field.type === "number") {
      params[field.name] = null;
    } else if (field.type === "boolean") {
      params[field.name] = false;
    }
  }
  return params;
}

export function getMissingRequiredParams(
  schema: ParamSchema,
  params: Record<string, unknown>,
): string[] {
  return schema.fields
    .filter((f) => f.required)
    .filter((f) => {
      const v = params[f.name];
      return v === undefined || v === null || v === "";
    })
    .map((f) => f.name);
}

export function pickBatchableParams(
  params: Record<string, unknown>,
  batchKeyFields: string[],
): Record<string, unknown> {
  const picked: Record<string, unknown> = {};
  for (const key of batchKeyFields) {
    if (key in params) {
      picked[key] = params[key];
    }
  }
  return picked;
}

const BATCHABLE_CANDIDATES = [
  "expression_temperature",
  "expression_time",
  "probes_type",
  "running_buffer",
  "kinetics",
  "gain",
  "assay_type",
  "buffer_k",
  "buffer_be",
  "buffer_r",
  "dilution_factor",
  "final_dilution_factor",
  "expression_dilution_factor",
  "capillary_type",
  "chip_type",
  "assay_condition",
  "property_4",
];

export function inferBatchKeyFields(fields: ParamField[]): string[] {
  const names = new Set(fields.map((f) => f.name));
  return BATCHABLE_CANDIDATES.filter((c) => names.has(c));
}
