/**
 * Reads data/lab-runner JSON and emits committed TypeScript catalog files.
 * Run: node scripts/generate-domain-catalog.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.join(__dirname, "..");
const DOMAIN = path.join(REPO, "apps/web/src/domain");

function humanizeParamName(name) {
  return name
    .split("_")
    .map((part) => (part.length > 0 ? part[0].toUpperCase() + part.slice(1) : part))
    .join(" ");
}

function mapFieldType(jsonType) {
  if (jsonType === "select") return "select";
  if (jsonType === "array") return "array";
  if (jsonType === "boolean") return "boolean";
  if (jsonType === "number") return "number";
  if (jsonType === "file") return "file";
  return "string";
}

function parseProperties(properties, required = []) {
  if (!properties) return [];
  return Object.entries(properties).map(([name, prop]) => {
    const field = {
      name,
      type: mapFieldType(prop.type),
      required: required.includes(name),
    };
    if (prop.unit) field.unit = prop.unit;
    if (prop.default !== undefined) field.default = prop.default;
    if (prop.options) field.options = prop.options;
    if (prop.title) field.title = prop.title;
    else field.title = humanizeParamName(name);
    if (prop.description) field.description = prop.description;
    if (prop.type === "array" && prop.items?.properties) {
      field.itemFields = parseProperties(
        prop.items.properties,
        prop.items.required ?? [],
      );
    }
    return field;
  });
}

function parseParamSchema(dataJsonSchema) {
  if (!dataJsonSchema) {
    return { title: undefined, fields: [] };
  }
  const required = dataJsonSchema.required ?? [];
  const properties = dataJsonSchema.properties ?? {};
  return {
    title: dataJsonSchema.title,
    fields: parseProperties(properties, required),
  };
}

function serializeValue(v, indent = 2) {
  if (v === undefined) return "undefined";
  return JSON.stringify(v, null, indent)
    .split("\n")
    .map((line, i) => (i === 0 ? line : "  ".repeat(indent / 2) + line))
    .join("\n");
}

function emitTaskTemplates(templates) {
  const byTemplateId = new Map();
  for (const row of templates.data) {
    const id = row.task_template_id;
    if (!byTemplateId.has(id)) {
      byTemplateId.set(id, row);
    }
  }

  const entries = [...byTemplateId.values()].sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  const lines = entries.map((row) => {
    const schema = parseParamSchema(row.data_json_schema);
    const plateTypeId =
      row.data_json_schema?.metadata?.plateTypeId ?? undefined;
    const machineTypeId = row.machine_type_id ?? undefined;

    return `  {
    id: ${JSON.stringify(row.task_template_id)},
    name: ${JSON.stringify(row.name)},
    durationMinutes: ${row.duration},
    plateTypeId: ${plateTypeId ? JSON.stringify(plateTypeId) : "undefined"},
    machineTypeId: ${machineTypeId ? JSON.stringify(machineTypeId) : "undefined"},
    paramSchema: ${JSON.stringify(schema, null, 4).replace(/\n/g, "\n    ")},
  }`;
  });

  const content = `/* eslint-disable -- generated file */
import type { TaskTemplateBase } from "./types";

/** Auto-generated from data/lab-runner/task-templates.json — do not edit by hand. */
export const TASK_TEMPLATE_BASES: TaskTemplateBase[] = [
${lines.join(",\n")},
];
`;

  const out = path.join(DOMAIN, "task-template/catalog.generated.ts");
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, content);
  console.log("wrote", out, entries.length, "templates");
}

function emitPlateTypes(plateData) {
  const lines = plateData.plate_types
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(
      (p) =>
        `  { id: ${JSON.stringify(p.id)}, name: ${JSON.stringify(p.name)}, capacityWells: undefined },`,
    );

  const content = `/* eslint-disable -- generated file */
import type { PlateType } from "./types";

/** Auto-generated from data/lab-runner/plate-types.json — do not edit by hand. */
export const PLATE_TYPES_GENERATED: PlateType[] = [
${lines.join("\n")}
];
`;

  const out = path.join(DOMAIN, "plate/plate-types.generated.ts");
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, content);
  console.log("wrote", out, plateData.plate_types.length, "plate types");
}

const templates = JSON.parse(
  fs.readFileSync(
    path.join(REPO, "data/lab-runner/task-templates.json"),
    "utf8",
  ),
);
const plates = JSON.parse(
  fs.readFileSync(path.join(REPO, "data/lab-runner/plate-types.json"), "utf8"),
);

function emitWorkflowPresets(workflowsData, templateIds) {
  const unknown = [];
  for (const workflow of workflowsData.workflows) {
    for (const step of workflow.steps) {
      if (!templateIds.has(step.task_template_id)) {
        unknown.push({ workflow: workflow.id, id: step.task_template_id });
      }
    }
  }
  if (unknown.length > 0) {
    console.error("experiment-workflows.json references unknown template IDs:");
    for (const u of unknown) {
      console.error(`  ${u.workflow}: ${u.id}`);
    }
    process.exit(1);
  }

  const lines = workflowsData.workflows.map((workflow) => {
    const stepLines = workflow.steps
      .map((step) => {
        const optional = step.optional ? ", optional: true" : "";
        return `      { taskTemplateId: ${JSON.stringify(step.task_template_id)}${optional} },`;
      })
      .join("\n");

    const methodName = workflow.method_name
      ? `    methodName: ${JSON.stringify(workflow.method_name)},\n`
      : "";

    return `  {
    id: ${JSON.stringify(workflow.id)},
    experimentType: ${JSON.stringify(workflow.experiment_type)},
${methodName}    label: ${JSON.stringify(workflow.label)},
    steps: [
${stepLines}
    ],
  }`;
  });

  const content = `/* eslint-disable -- generated file */
import type { WorkflowTemplate } from "./types";

/** Auto-generated from data/lab-runner/experiment-workflows.json — do not edit by hand. */
export const WORKFLOW_PRESETS_GENERATED: WorkflowTemplate[] = [
${lines.join(",\n")},
];
`;

  const out = path.join(DOMAIN, "workflow/presets.generated.ts");
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, content);
  console.log("wrote", out, workflowsData.workflows.length, "workflows");
}

const templateIds = new Set(
  templates.data.map((row) => row.task_template_id),
);

emitTaskTemplates(templates);
emitPlateTypes(plates);

const workflows = JSON.parse(
  fs.readFileSync(
    path.join(REPO, "data/lab-runner/experiment-workflows.json"),
    "utf8",
  ),
);
emitWorkflowPresets(workflows, templateIds);
