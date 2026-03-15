/**
 * Validates generated JSON files against their schemas.
 *
 * Usage: `deno task validate-contracts [--site-dir=_site]`
 *
 * Validates:
 * - `/api/posts/*.json` against `contracts/post.schema.json`
 * - `/feed.json` (and localized variants) against `contracts/feed.schema.json`
 *
 * Exits with code 1 if any validation error is found.
 */

import { bold, green, red, yellow } from "jsr/fmt-colors";

/** Minimal JSON Schema validator for the subset of features we use. */
interface SchemaNode {
  readonly type?: string;
  readonly const?: unknown;
  readonly required?: ReadonlyArray<string>;
  readonly properties?: Readonly<Record<string, SchemaNode>>;
  readonly additionalProperties?: boolean;
  readonly items?: SchemaNode;
  readonly oneOf?: ReadonlyArray<SchemaNode>;
  readonly $ref?: string;
  readonly $defs?: Readonly<Record<string, SchemaNode>>;
  readonly minLength?: number;
  readonly minimum?: number;
  readonly maximum?: number;
  readonly format?: string;
  readonly pattern?: string;
}

interface ValidationError {
  readonly path: string;
  readonly message: string;
}

/** Resolves a `$ref` pointer within the root schema. */
function resolveRef(
  ref: string,
  root: SchemaNode,
): SchemaNode | undefined {
  const parts = ref.replace(/^#\//, "").split("/");
  // deno-lint-ignore no-explicit-any
  let current: any = root;
  for (const part of parts) {
    if (current === undefined || current === null) return undefined;
    current = current[part];
  }
  return current as SchemaNode | undefined;
}

/** Validates a value against a schema node, returning errors. */
function validate(
  value: unknown,
  schema: SchemaNode,
  root: SchemaNode,
  path: string,
): ReadonlyArray<ValidationError> {
  const errors: ValidationError[] = [];

  // Resolve $ref
  if (schema.$ref !== undefined) {
    const resolved = resolveRef(schema.$ref, root);
    if (resolved === undefined) {
      errors.push({ path, message: `Cannot resolve $ref: ${schema.$ref}` });
      return errors;
    }
    return validate(value, resolved, root, path);
  }

  // oneOf
  if (schema.oneOf !== undefined) {
    const matches = schema.oneOf.filter(
      (s) => validate(value, s, root, path).length === 0,
    );
    if (matches.length === 0) {
      errors.push({ path, message: "Does not match any oneOf variant" });
    }
    return errors;
  }

  // const
  if (schema.const !== undefined) {
    if (value !== schema.const) {
      errors.push({
        path,
        message: `Expected ${JSON.stringify(schema.const)}, got ${
          JSON.stringify(value)
        }`,
      });
    }
    return errors;
  }

  // Type check
  if (schema.type !== undefined) {
    const actualType = Array.isArray(value) ? "array" : typeof value;
    const expectedType = schema.type === "integer" ? "number" : schema.type;
    if (actualType !== expectedType) {
      errors.push({
        path,
        message: `Expected type "${schema.type}", got "${actualType}"`,
      });
      return errors;
    }

    if (schema.type === "integer" && !Number.isInteger(value)) {
      errors.push({ path, message: "Expected integer" });
      return errors;
    }
  }

  // String constraints
  if (typeof value === "string") {
    if (schema.minLength !== undefined && value.length < schema.minLength) {
      errors.push({
        path,
        message: `String too short (min ${schema.minLength})`,
      });
    }
    if (
      schema.pattern !== undefined && !new RegExp(schema.pattern).test(value)
    ) {
      errors.push({
        path,
        message: `Does not match pattern: ${schema.pattern}`,
      });
    }
  }

  // Number constraints
  if (typeof value === "number") {
    if (schema.minimum !== undefined && value < schema.minimum) {
      errors.push({ path, message: `Below minimum ${schema.minimum}` });
    }
    if (schema.maximum !== undefined && value > schema.maximum) {
      errors.push({ path, message: `Above maximum ${schema.maximum}` });
    }
  }

  // Object properties
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    const obj = value as Record<string, unknown>;

    if (schema.required !== undefined) {
      for (const key of schema.required) {
        if (!(key in obj)) {
          errors.push({
            path: `${path}.${key}`,
            message: "Required property missing",
          });
        }
      }
    }

    if (schema.properties !== undefined) {
      for (const [key, propSchema] of Object.entries(schema.properties)) {
        if (key in obj) {
          errors.push(
            ...validate(obj[key], propSchema, root, `${path}.${key}`),
          );
        }
      }
    }
  }

  // Array items
  if (Array.isArray(value) && schema.items !== undefined) {
    for (let i = 0; i < value.length; i++) {
      errors.push(
        ...validate(value[i], schema.items, root, `${path}[${i}]`),
      );
    }
  }

  return errors;
}

/** Finds JSON files matching a glob pattern in the site output directory. */
async function findJsonFiles(
  dir: string,
  pattern: RegExp,
): Promise<ReadonlyArray<string>> {
  const files: string[] = [];

  async function walk(currentDir: string): Promise<void> {
    for await (const entry of Deno.readDir(currentDir)) {
      const fullPath = `${currentDir}/${entry.name}`;
      if (entry.isDirectory) {
        await walk(fullPath);
      } else if (entry.isFile && pattern.test(fullPath)) {
        files.push(fullPath);
      }
    }
  }

  await walk(dir);
  return files.sort();
}

async function main(): Promise<void> {
  const siteDir = Deno.args.find((a) => a.startsWith("--site-dir="))
    ?.split("=")[1] ?? "_site";

  console.log(bold("Content contract validation"));
  console.log(`Site directory: ${siteDir}\n`);

  const postSchemaText = await Deno.readTextFile("contracts/post.schema.json");
  const postSchema: SchemaNode = JSON.parse(postSchemaText);

  const feedSchemaText = await Deno.readTextFile("contracts/feed.schema.json");
  const feedSchema: SchemaNode = JSON.parse(feedSchemaText);

  let totalErrors = 0;
  let totalFiles = 0;

  // Validate post JSON files
  const postFiles = await findJsonFiles(siteDir, /\/api\/posts\/[^/]+\.json$/);
  console.log(bold(`Post files: ${postFiles.length}`));

  for (const filePath of postFiles) {
    totalFiles++;
    const content = await Deno.readTextFile(filePath);
    const data: unknown = JSON.parse(content);
    const errors = validate(data, postSchema, postSchema, "$");

    if (errors.length > 0) {
      console.log(red(`  FAIL ${filePath}`));
      for (const error of errors) {
        console.log(`    ${yellow(error.path)}: ${error.message}`);
      }
      totalErrors += errors.length;
    } else {
      console.log(green(`  OK   ${filePath}`));
    }
  }

  // Validate feed JSON files
  const feedFiles = await findJsonFiles(siteDir, /\/feed\.json$/);
  console.log(bold(`\nFeed files: ${feedFiles.length}`));

  for (const filePath of feedFiles) {
    totalFiles++;
    const content = await Deno.readTextFile(filePath);
    const data: unknown = JSON.parse(content);
    const errors = validate(data, feedSchema, feedSchema, "$");

    if (errors.length > 0) {
      console.log(red(`  FAIL ${filePath}`));
      for (const error of errors) {
        console.log(`    ${yellow(error.path)}: ${error.message}`);
      }
      totalErrors += errors.length;
    } else {
      console.log(green(`  OK   ${filePath}`));
    }
  }

  console.log(
    `\n${bold("Result:")} ${totalFiles} files checked, ${totalErrors} errors`,
  );

  if (totalErrors > 0) {
    Deno.exit(1);
  }
}

main();
