#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const methods = new Set(["get", "put", "post", "delete", "options", "head", "patch", "trace"]);
const writes = new Set(["post", "put", "patch"]);
const file = process.argv[2];

if (!file) {
  console.error("用法: node check-openapi.mjs <openapi.json>");
  process.exit(2);
}

let spec;
try {
  spec = JSON.parse(await readFile(file, "utf8"));
} catch (error) {
  console.error(JSON.stringify({ valid: false, errors: [`无法读取 OpenAPI JSON: ${error.message}`] }, null, 2));
  process.exit(2);
}

const errors = [];
const operations = [];
const schemaProperties = [];
let arraySchemas = 0;
let arraysWithItems = 0;
let arraysWithBounds = 0;
let conditionalSchemas = 0;

if (!String(spec.openapi || "").startsWith("3.")) errors.push("openapi 必须为 3.x");
if (!spec.info?.title) errors.push("缺少 info.title");
if (!spec.info?.version) errors.push("缺少 info.version");
if (!spec.paths || typeof spec.paths !== "object" || Array.isArray(spec.paths)) errors.push("缺少 paths 对象");

for (const [path, item] of Object.entries(spec.paths || {})) {
  for (const [method, operation] of Object.entries(item || {})) {
    if (!methods.has(method.toLowerCase())) continue;
    operations.push({ path, method: method.toLowerCase(), operation: operation || {} });
  }
}

const hasBody = ({ operation }) => Boolean(operation.requestBody?.content && Object.keys(operation.requestBody.content).length);
const isEmptyBody = ({ operation }) => Object.values(operation.requestBody?.content || {}).some((entry) => {
  const schema = entry?.schema;
  if (!schema || schema.$ref || schema.allOf || schema.oneOf || schema.anyOf) return false;
  return schema.type === "object" && !Object.keys(schema.properties || {}).length && !schema.additionalProperties;
});

for (const { path, method, operation } of operations) {
  if (!operation.responses || !Object.keys(operation.responses).length) errors.push(`${method.toUpperCase()} ${path} 缺少 responses`);
}

const constraintKeys = new Set([
  "enum", "const", "format", "pattern", "minimum", "maximum", "exclusiveMinimum",
  "exclusiveMaximum", "multipleOf", "minLength", "maxLength", "minItems", "maxItems",
  "minProperties", "maxProperties", "contains", "minContains", "maxContains", "oneOf",
  "anyOf", "allOf", "not", "if", "then", "else"
]);
const conditionalKeys = new Set(["contains", "minContains", "maxContains", "oneOf", "anyOf", "allOf", "not", "if", "then", "else"]);

const inspectSchema = (schema) => {
  if (!schema || typeof schema !== "object" || Array.isArray(schema)) return;
  if (schema.type === "array") {
    arraySchemas += 1;
    if (schema.items) arraysWithItems += 1;
    if (schema.minItems !== undefined || schema.maxItems !== undefined || schema.contains) arraysWithBounds += 1;
  }
  if (Object.keys(schema).some((key) => conditionalKeys.has(key))) conditionalSchemas += 1;
  for (const [name, property] of Object.entries(schema.properties || {})) {
    schemaProperties.push({
      name,
      described: Boolean(property?.description?.trim()),
      constrained: Object.keys(property || {}).some((key) => constraintKeys.has(key))
    });
  }
  for (const value of Object.values(schema)) {
    if (Array.isArray(value)) value.forEach(inspectSchema);
    else if (value && typeof value === "object") inspectSchema(value);
  }
};

Object.values(spec.components?.schemas || {}).forEach(inspectSchema);

const writeOperations = operations.filter(({ method }) => writes.has(method));
const result = {
  valid: errors.length === 0,
  errors,
  metrics: {
    paths: Object.keys(spec.paths || {}).length,
    operations: operations.length,
    schemas: Object.keys(spec.components?.schemas || {}).length,
    writes: writeOperations.length,
    withBody: writeOperations.filter(hasBody).length,
    emptyObjectBodies: writeOperations.filter(isEmptyBody).length,
    withResponses: operations.filter(({ operation }) => Object.keys(operation.responses || {}).length).length,
    tagged: operations.filter(({ operation }) => Array.isArray(operation.tags) && operation.tags.length).length,
    missingSummary: operations.filter(({ operation }) => !operation.summary).length,
    schemaProperties: schemaProperties.length,
    describedSchemaProperties: schemaProperties.filter(({ described }) => described).length,
    constrainedSchemaProperties: schemaProperties.filter(({ constrained }) => constrained).length,
    arraySchemas,
    arraysWithItems,
    arraysWithBounds,
    conditionalSchemas
  }
};

console.log(JSON.stringify(result, null, 2));
process.exit(result.valid ? 0 : 1);
