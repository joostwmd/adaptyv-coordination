import type { ParamField, ParamSchema } from "./types";

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
