import { Validator, type OutputUnit, type Schema } from "@cfworker/json-schema";

export interface Invalid {
  field: string;
  problem: string;
}

const validators = new WeakMap<object, Validator>();

export function validate(schema: object, value: unknown): Invalid[] {
  let validator = validators.get(schema);
  if (!validator) {
    validator = new Validator(schema as Schema, "2020-12", false);
    validators.set(schema, validator);
  }
  const result = validator.validate(value);
  if (result.valid) return [];
  return describe(result.errors, schema);
}

function describe(errors: OutputUnit[], schema: object): Invalid[] {
  const found = new Map<string, string>();
  for (const unit of errors) {
    if (unit.keyword === "properties" || unit.keyword === "allOf") continue;
    const field = fieldOf(unit);
    if (field === "" && unit.keyword === "anyOf" && isContactRule(schema)) {
      found.set("email", "Provide an email address or a phone number.");
      continue;
    }
    if (!found.has(field)) found.set(field, unit.error);
  }
  return [...found].map(([field, problem]) => ({ field, problem }));
}

function fieldOf(unit: OutputUnit): string {
  const required = /required property "([^"]+)"/.exec(unit.error);
  if (unit.keyword === "required" && required) return required[1];
  const additional = /Property "([^"]+)" does not match additional properties schema/.exec(unit.error);
  if (additional) return additional[1];
  return unit.instanceLocation.replace(/^#\/?/, "").split("/")[0] ?? "";
}

function isContactRule(schema: object): boolean {
  return "anyOf" in schema;
}
