/**
 * Validates generated JSON files against their schemas.
 *
 * Usage: `deno task validate-contracts [--site-dir=_site]`
 *
 * Validates:
 * - `/feed.json` (and localized variants) against `contracts/feed.schema.json`
 * - optional `/api/posts/*.json` files against `contracts/post.schema.json`
 *   when the content-contract plugin is enabled
 *
 * Exits with code 1 if any validation error is found.
 */

import { bold, green, red, yellow } from "jsr/fmt-colors";

/** Minimal JSON Schema validator for the subset of features we use. */
export interface SchemaNode {
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

export interface ValidationError {
  readonly path: string;
  readonly message: string;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
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

function createPatternMatcher(
  pattern: string,
  path: string,
): RegExp | ValidationError {
  try {
    return new RegExp(pattern);
  } catch (error) {
    return {
      path,
      message: `Invalid schema pattern "${pattern}": ${getErrorMessage(error)}`,
    };
  }
}

function isValidDateTime(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/
    .test(value) && !Number.isNaN(Date.parse(value));
}

function isValidUri(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/** Validates a value against a schema node, returning errors. */
export function validate(
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
    if (schema.pattern !== undefined) {
      const matcher = createPatternMatcher(schema.pattern, path);

      if (matcher instanceof RegExp) {
        if (!matcher.test(value)) {
          errors.push({
            path,
            message: `Does not match pattern: ${schema.pattern}`,
          });
        }
      } else {
        errors.push(matcher);
      }
    }

    if (schema.format === "date-time" && !isValidDateTime(value)) {
      errors.push({
        path,
        message: "Expected RFC 3339 date-time string",
      });
    }

    if (schema.format === "uri" && !isValidUri(value)) {
      errors.push({
        path,
        message: "Expected absolute HTTP(S) URI",
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

/** Reads and parses a JSON file with contextualized failures. */
export async function readJsonFile(filePath: string): Promise<unknown> {
  let content: string;

  try {
    content = await Deno.readTextFile(filePath);
  } catch (error) {
    throw new Error(
      `Cannot read JSON file "${filePath}": ${getErrorMessage(error)}`,
    );
  }

  try {
    return JSON.parse(content) as unknown;
  } catch (error) {
    throw new Error(
      `Cannot parse JSON file "${filePath}": ${getErrorMessage(error)}`,
    );
  }
}

/** Reads a JSON schema file and ensures the root value is an object. */
export async function readSchemaFile(filePath: string): Promise<SchemaNode> {
  const value = await readJsonFile(filePath);

  if (!isRecord(value)) {
    throw new Error(
      `Schema file "${filePath}" must contain a JSON object at the root`,
    );
  }

  return value as SchemaNode;
}

/** Reads a text file with contextualized failures. */
async function readTextFile(filePath: string): Promise<string> {
  try {
    return await Deno.readTextFile(filePath);
  } catch (error) {
    throw new Error(
      `Cannot read text file "${filePath}": ${getErrorMessage(error)}`,
    );
  }
}

/** Finds output files matching a regex pattern in the site output directory. */
async function findOutputFiles(
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

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getTagText(xml: string, tagName: string): string | undefined {
  const matcher = new RegExp(
    `<${escapeRegExp(tagName)}\\b[^>]*>([\\s\\S]*?)<\\/${
      escapeRegExp(tagName)
    }>`,
    "m",
  );
  const match = xml.match(matcher);
  const value = match?.[1]?.trim();
  return value && value.length > 0 ? value : undefined;
}

function getElements(xml: string, tagName: string): string[] {
  const matcher = new RegExp(
    `<${escapeRegExp(tagName)}\\b[^>]*>([\\s\\S]*?)<\\/${
      escapeRegExp(tagName)
    }>`,
    "g",
  );

  return Array.from(xml.matchAll(matcher), (match) => match[1] ?? "");
}

function getStartTags(xml: string, tagName: string): string[] {
  const matcher = new RegExp(
    `<${escapeRegExp(tagName)}\\b[^>]*\\/?>`,
    "g",
  );

  return Array.from(xml.matchAll(matcher), (match) => match[0]);
}

function hasTagWithAttributes(
  xml: string,
  tagName: string,
  attributes: Record<string, string>,
): boolean {
  return getStartTags(xml, tagName).some((tag) =>
    Object.entries(attributes).every(([name, value]) =>
      tag.includes(`${name}="${value}"`)
    )
  );
}

function validateRssFeed(content: string): ReadonlyArray<ValidationError> {
  const errors: ValidationError[] = [];

  if (
    !/^<\?xml version="1\.0" encoding="UTF-8"\?>/m.test(content)
  ) {
    errors.push({
      path: "$.xml",
      message: "Missing XML declaration with UTF-8 encoding",
    });
  }

  if (!/<\?xml-stylesheet\b[^>]*href="\/feed\.xsl"\?>/m.test(content)) {
    errors.push({
      path: "$.xml-stylesheet",
      message: "Missing feed stylesheet processing instruction",
    });
  }

  if (!/<rss\b[^>]*version="2\.0"/m.test(content)) {
    errors.push({
      path: "$.rss",
      message: "Root element must be RSS 2.0",
    });
  }

  const channel = getTagText(content, "channel");
  if (!channel) {
    errors.push({
      path: "$.rss.channel",
      message: "Missing channel element",
    });
    return errors;
  }

  for (
    const tagName of [
      "title",
      "link",
      "description",
      "language",
      "lastBuildDate",
    ]
  ) {
    if (!getTagText(channel, tagName)) {
      errors.push({
        path: `$.rss.channel.${tagName}`,
        message: "Required element missing or empty",
      });
    }
  }

  const lastBuildDate = getTagText(channel, "lastBuildDate");
  if (lastBuildDate && Number.isNaN(Date.parse(lastBuildDate))) {
    errors.push({
      path: "$.rss.channel.lastBuildDate",
      message: "Must be a parseable RFC 2822 date",
    });
  }

  if (
    !hasTagWithAttributes(channel, "atom:link", {
      rel: "self",
      type: "application/rss+xml",
    })
  ) {
    errors.push({
      path: "$.rss.channel.atom:link",
      message: "Missing self-referencing Atom link for the RSS feed",
    });
  }

  const items = getElements(channel, "item");
  for (const [index, item] of items.entries()) {
    for (const tagName of ["title", "link", "guid", "pubDate"]) {
      if (!getTagText(item, tagName)) {
        errors.push({
          path: `$.rss.channel.item[${index}].${tagName}`,
          message: "Required element missing or empty",
        });
      }
    }

    const link = getTagText(item, "link");
    if (link && !isValidUri(link)) {
      errors.push({
        path: `$.rss.channel.item[${index}].link`,
        message: "Must be an absolute HTTP(S) URI",
      });
    }

    const guid = getTagText(item, "guid");
    if (guid && !isValidUri(guid)) {
      errors.push({
        path: `$.rss.channel.item[${index}].guid`,
        message: "Must be an absolute HTTP(S) URI",
      });
    }

    const pubDate = getTagText(item, "pubDate");
    if (pubDate && Number.isNaN(Date.parse(pubDate))) {
      errors.push({
        path: `$.rss.channel.item[${index}].pubDate`,
        message: "Must be a parseable RFC 2822 date",
      });
    }
  }

  return errors;
}

function validateAtomFeed(content: string): ReadonlyArray<ValidationError> {
  const errors: ValidationError[] = [];

  if (
    !/^<\?xml version="1\.0" encoding="UTF-8"\?>/m.test(content)
  ) {
    errors.push({
      path: "$.xml",
      message: "Missing XML declaration with UTF-8 encoding",
    });
  }

  if (!/<\?xml-stylesheet\b[^>]*href="\/feed\.xsl"\?>/m.test(content)) {
    errors.push({
      path: "$.xml-stylesheet",
      message: "Missing feed stylesheet processing instruction",
    });
  }

  if (!/<feed\b[^>]*xmlns="http:\/\/www\.w3\.org\/2005\/Atom"/m.test(content)) {
    errors.push({
      path: "$.feed",
      message: "Root element must declare the Atom namespace",
    });
  }

  for (const tagName of ["id", "title", "updated"]) {
    if (!getTagText(content, tagName)) {
      errors.push({
        path: `$.feed.${tagName}`,
        message: "Required element missing or empty",
      });
    }
  }

  if (!getTagText(content, "author")) {
    errors.push({
      path: "$.feed.author",
      message: "Feed author is required for Atom conformance",
    });
  }

  const updated = getTagText(content, "updated");
  if (updated && !isValidDateTime(updated)) {
    errors.push({
      path: "$.feed.updated",
      message: "Must be a valid RFC 3339 date-time",
    });
  }

  if (
    !hasTagWithAttributes(content, "link", {
      rel: "self",
      type: "application/atom+xml",
    })
  ) {
    errors.push({
      path: "$.feed.link[self]",
      message: "Missing self-referencing Atom link",
    });
  }

  if (
    !hasTagWithAttributes(content, "link", {
      rel: "alternate",
      type: "text/html",
    })
  ) {
    errors.push({
      path: "$.feed.link[alternate]",
      message: "Missing alternate HTML link",
    });
  }

  const entries = getElements(content, "entry");
  for (const [index, entry] of entries.entries()) {
    for (const tagName of ["id", "title", "updated"]) {
      if (!getTagText(entry, tagName)) {
        errors.push({
          path: `$.feed.entry[${index}].${tagName}`,
          message: "Required element missing or empty",
        });
      }
    }

    const entryUpdated = getTagText(entry, "updated");
    if (entryUpdated && !isValidDateTime(entryUpdated)) {
      errors.push({
        path: `$.feed.entry[${index}].updated`,
        message: "Must be a valid RFC 3339 date-time",
      });
    }

    const entryContent = getTagText(entry, "content");
    if (
      entryContent &&
      hasTagWithAttributes(entry, "content", { type: "html" }) &&
      (entryContent.includes("<![CDATA[") ||
        /<[a-zA-Z][^>]*>/.test(entryContent))
    ) {
      errors.push({
        path: `$.feed.entry[${index}].content`,
        message:
          "Atom HTML content must be entity-escaped, not embedded as raw markup",
      });
    }
  }

  return errors;
}

async function main(): Promise<void> {
  const siteDir = Deno.args.find((a) => a.startsWith("--site-dir="))
    ?.split("=")[1] ?? "_site";

  console.log(bold("Generated feed/content validation"));
  console.log(`Site directory: ${siteDir}\n`);

  const postSchema = await readSchemaFile("contracts/post.schema.json");
  const feedSchema = await readSchemaFile("contracts/feed.schema.json");

  let totalErrors = 0;
  let totalFiles = 0;

  // Validate post JSON files
  const postFiles = await findOutputFiles(
    siteDir,
    /\/api\/posts\/[^/]+\.json$/,
  );
  console.log(bold(`Post files: ${postFiles.length}`));

  for (const filePath of postFiles) {
    totalFiles++;
    const data = await readJsonFile(filePath);
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
  const feedFiles = await findOutputFiles(siteDir, /\/feed\.json$/);
  console.log(bold(`\nFeed files: ${feedFiles.length}`));

  for (const filePath of feedFiles) {
    totalFiles++;
    const data = await readJsonFile(filePath);
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

  // Validate RSS feed XML files
  const rssFiles = await findOutputFiles(siteDir, /\/feed\.xml$/);
  console.log(bold(`\nRSS feed files: ${rssFiles.length}`));

  for (const filePath of rssFiles) {
    totalFiles++;
    const content = await readTextFile(filePath);
    const errors = validateRssFeed(content);

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

  // Validate Atom feed XML files
  const atomFiles = await findOutputFiles(siteDir, /\/atom\.xml$/);
  console.log(bold(`\nAtom feed files: ${atomFiles.length}`));

  for (const filePath of atomFiles) {
    totalFiles++;
    const content = await readTextFile(filePath);
    const errors = validateAtomFeed(content);

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

if (import.meta.main) {
  main().catch((error) => {
    console.error(red(`Validation failed: ${getErrorMessage(error)}`));
    Deno.exit(1);
  });
}
