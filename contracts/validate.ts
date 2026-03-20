/**
 * Validates generated feed and mobile-contract files against their schemas.
 *
 * Usage: `deno task validate-contracts [--site-dir=_site]`
 *
 * Validates:
 * - `/feed.json` (and localized variants) against `contracts/feed.schema.json`
 * - `/api/app-manifest.json` against `contracts/app-manifest.schema.json`
 * - localized `/api/posts/index.json` files against
 *   `contracts/posts-index.schema.json`
 * - example app-contract fixtures under `contracts/examples/`
 * - optional legacy `/api/posts/*.json` files against `contracts/post.schema.json`
 *   when the older content-contract plugin is enabled
 *
 * Exits with code 1 if any validation error is found.
 */

import { parseArgs } from "jsr/cli";
import { walk } from "jsr/fs";
import { bold, green, red, yellow } from "jsr/fmt-colors";
import { isCData, isElement, isText, parse } from "jsr/xml";

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

type XmlDocument = ReturnType<typeof parse>;
type XmlElement = XmlDocument["root"];
type XmlChildNode = XmlElement["children"][number];
type FilePath = string | URL;

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
export async function readJsonFile(filePath: FilePath): Promise<unknown> {
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
export async function readSchemaFile(filePath: FilePath): Promise<SchemaNode> {
  const value = await readJsonFile(filePath);

  if (!isRecord(value)) {
    throw new Error(
      `Schema file "${filePath}" must contain a JSON object at the root`,
    );
  }

  return value as SchemaNode;
}

/** Reads a text file with contextualized failures. */
async function readTextFile(filePath: FilePath): Promise<string> {
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

  for await (
    const entry of walk(dir, {
      includeDirs: false,
    })
  ) {
    const fullPath = entry.path.replaceAll("\\", "/");

    if (pattern.test(fullPath)) {
      files.push(fullPath);
    }
  }

  return files.sort();
}

function parseCliArgs(args: ReadonlyArray<string>): { siteDir: string } {
  const parsedArgs = parseArgs(args, {
    string: ["site-dir"],
    default: {
      "site-dir": "_site",
    },
  });
  const siteDir = parsedArgs["site-dir"];

  return {
    siteDir: typeof siteDir === "string" && siteDir.length > 0
      ? siteDir
      : "_site",
  };
}

function parseXmlDocument(
  content: string,
): XmlDocument | ValidationError {
  try {
    return parse(content);
  } catch (error) {
    return {
      path: "$.xml",
      message: `Malformed XML: ${getErrorMessage(error)}`,
    };
  }
}

function isValidationError(
  value: XmlDocument | ValidationError,
): value is ValidationError {
  return "path" in value;
}

function getChildElements(
  element: XmlElement,
  tagName?: string,
): XmlElement[] {
  return element.children.filter((child): child is XmlElement =>
    isElement(child) && (tagName === undefined || child.name.raw === tagName)
  );
}

function getFirstChildElement(
  element: XmlElement,
  tagName: string,
): XmlElement | undefined {
  return getChildElements(element, tagName)[0];
}

function getChildText(
  element: XmlElement,
  tagName: string,
): string | undefined {
  const child = getFirstChildElement(element, tagName);
  return child ? getElementText(child) : undefined;
}

function getElementText(element: XmlElement): string | undefined {
  const value = element.children
    .map((child) => {
      if (isText(child) || isCData(child)) {
        return child.text;
      }

      if (isElement(child)) {
        return getElementText(child) ?? "";
      }

      return "";
    })
    .join("")
    .trim();
  return value.length > 0 ? value : undefined;
}

function hasDirectChildWithAttributes(
  element: XmlElement,
  tagName: string,
  attributes: Record<string, string>,
): boolean {
  return getChildElements(element, tagName).some((child) =>
    Object.entries(attributes).every(([name, value]) =>
      child.attributes[name] === value
    )
  );
}

function hasXmlDeclaration(document: XmlDocument): boolean {
  return document.declaration?.version === "1.0" &&
    document.declaration.encoding === "UTF-8";
}

function hasStylesheetProcessingInstruction(content: string): boolean {
  return /<\?xml-stylesheet\b[^>]*href=(["'])\/feed\.xsl\1[^>]*\?>/m.test(
    content,
  );
}

function hasRawHtmlChildren(element: XmlElement): boolean {
  return element.children.some((child) => isElement(child) || isCData(child));
}

export function validateRssFeed(
  content: string,
): ReadonlyArray<ValidationError> {
  const errors: ValidationError[] = [];
  const document = parseXmlDocument(content);

  if (isValidationError(document)) {
    return [document];
  }

  if (!hasXmlDeclaration(document)) {
    errors.push({
      path: "$.xml",
      message: "Missing XML declaration with UTF-8 encoding",
    });
  }

  if (!hasStylesheetProcessingInstruction(content)) {
    errors.push({
      path: "$.xml-stylesheet",
      message: "Missing feed stylesheet processing instruction",
    });
  }

  const root = document.root;

  if (root.name.raw !== "rss" || root.attributes["version"] !== "2.0") {
    errors.push({
      path: "$.rss",
      message: "Root element must be RSS 2.0",
    });
  }

  const channel = getFirstChildElement(root, "channel");
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
    const element = getFirstChildElement(channel, tagName);
    if (!element || !getElementText(element)) {
      errors.push({
        path: `$.rss.channel.${tagName}`,
        message: "Required element missing or empty",
      });
    }
  }

  const lastBuildDate = getChildText(channel, "lastBuildDate");
  if (lastBuildDate && Number.isNaN(Date.parse(lastBuildDate))) {
    errors.push({
      path: "$.rss.channel.lastBuildDate",
      message: "Must be a parseable RFC 2822 date",
    });
  }

  if (
    !hasDirectChildWithAttributes(channel, "atom:link", {
      rel: "self",
      type: "application/rss+xml",
    })
  ) {
    errors.push({
      path: "$.rss.channel.atom:link",
      message: "Missing self-referencing Atom link for the RSS feed",
    });
  }

  const items = getChildElements(channel, "item");
  for (const [index, item] of items.entries()) {
    for (const tagName of ["title", "link", "guid", "pubDate"]) {
      const element = getFirstChildElement(item, tagName);
      if (!element || !getElementText(element)) {
        errors.push({
          path: `$.rss.channel.item[${index}].${tagName}`,
          message: "Required element missing or empty",
        });
      }
    }

    const link = getChildText(item, "link");
    if (link && !isValidUri(link)) {
      errors.push({
        path: `$.rss.channel.item[${index}].link`,
        message: "Must be an absolute HTTP(S) URI",
      });
    }

    const guid = getChildText(item, "guid");
    if (guid && !isValidUri(guid)) {
      errors.push({
        path: `$.rss.channel.item[${index}].guid`,
        message: "Must be an absolute HTTP(S) URI",
      });
    }

    const pubDate = getChildText(item, "pubDate");
    if (pubDate && Number.isNaN(Date.parse(pubDate))) {
      errors.push({
        path: `$.rss.channel.item[${index}].pubDate`,
        message: "Must be a parseable RFC 2822 date",
      });
    }
  }

  return errors;
}

export function validateAtomFeed(
  content: string,
): ReadonlyArray<ValidationError> {
  const errors: ValidationError[] = [];
  const document = parseXmlDocument(content);

  if (isValidationError(document)) {
    return [document];
  }

  if (!hasXmlDeclaration(document)) {
    errors.push({
      path: "$.xml",
      message: "Missing XML declaration with UTF-8 encoding",
    });
  }

  if (!hasStylesheetProcessingInstruction(content)) {
    errors.push({
      path: "$.xml-stylesheet",
      message: "Missing feed stylesheet processing instruction",
    });
  }

  const root = document.root;

  if (
    root.name.raw !== "feed" ||
    root.attributes["xmlns"] !== "http://www.w3.org/2005/Atom"
  ) {
    errors.push({
      path: "$.feed",
      message: "Root element must declare the Atom namespace",
    });
  }

  for (const tagName of ["id", "title", "updated"]) {
    const element = getFirstChildElement(root, tagName);
    if (!element || !getElementText(element)) {
      errors.push({
        path: `$.feed.${tagName}`,
        message: "Required element missing or empty",
      });
    }
  }

  if (!getChildText(root, "author")) {
    errors.push({
      path: "$.feed.author",
      message: "Feed author is required for Atom conformance",
    });
  }

  const updated = getChildText(root, "updated");
  if (updated && !isValidDateTime(updated)) {
    errors.push({
      path: "$.feed.updated",
      message: "Must be a valid RFC 3339 date-time",
    });
  }

  if (
    !hasDirectChildWithAttributes(root, "link", {
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
    !hasDirectChildWithAttributes(root, "link", {
      rel: "alternate",
      type: "text/html",
    })
  ) {
    errors.push({
      path: "$.feed.link[alternate]",
      message: "Missing alternate HTML link",
    });
  }

  const entries = getChildElements(root, "entry");
  for (const [index, entry] of entries.entries()) {
    for (const tagName of ["id", "title", "updated"]) {
      const element = getFirstChildElement(entry, tagName);
      if (!element || !getElementText(element)) {
        errors.push({
          path: `$.feed.entry[${index}].${tagName}`,
          message: "Required element missing or empty",
        });
      }
    }

    const entryUpdated = getChildText(entry, "updated");
    if (entryUpdated && !isValidDateTime(entryUpdated)) {
      errors.push({
        path: `$.feed.entry[${index}].updated`,
        message: "Must be a valid RFC 3339 date-time",
      });
    }

    const contentElement = getFirstChildElement(entry, "content");
    if (
      contentElement &&
      contentElement.attributes["type"] === "html" &&
      hasRawHtmlChildren(contentElement)
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
  const { siteDir } = parseCliArgs(Deno.args);

  console.log(bold("Generated feed/content validation"));
  console.log(`Site directory: ${siteDir}\n`);

  const appManifestSchema = await readSchemaFile(
    new URL("./app-manifest.schema.json", import.meta.url),
  );
  const postsIndexSchema = await readSchemaFile(
    new URL("./posts-index.schema.json", import.meta.url),
  );
  const postDetailSchema = await readSchemaFile(
    new URL("./post-detail.schema.json", import.meta.url),
  );
  const postSchema = await readSchemaFile(
    new URL("./post.schema.json", import.meta.url),
  );
  const feedSchema = await readSchemaFile(
    new URL("./feed.schema.json", import.meta.url),
  );

  let totalErrors = 0;
  let totalFiles = 0;

  async function validateJsonFiles(
    label: string,
    filePaths: ReadonlyArray<FilePath>,
    schema: SchemaNode,
  ): Promise<void> {
    console.log(bold(`\n${label}: ${filePaths.length}`));

    for (const filePath of filePaths) {
      totalFiles++;
      const data = await readJsonFile(filePath);
      const errors = validate(data, schema, schema, "$");

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
  }

  await validateJsonFiles(
    "App manifest files",
    await findOutputFiles(siteDir, /\/api\/app-manifest\.json$/),
    appManifestSchema,
  );

  await validateJsonFiles(
    "Posts index files",
    await findOutputFiles(siteDir, /\/api\/posts\/index\.json$/),
    postsIndexSchema,
  );

  // Validate post JSON files
  const postFiles = await findOutputFiles(
    siteDir,
    /\/api\/posts\/(?!index\.json$)[^/]+\.json$/,
  );
  await validateJsonFiles("Legacy post files", postFiles, postSchema);

  // Validate feed JSON files
  await validateJsonFiles(
    "Feed files",
    await findOutputFiles(siteDir, /\/feed\.json$/),
    feedSchema,
  );

  await validateJsonFiles(
    "Example app manifest files",
    [new URL("./examples/app-manifest.json", import.meta.url)],
    appManifestSchema,
  );

  await validateJsonFiles(
    "Example posts-index files",
    [new URL("./examples/posts-index-en.json", import.meta.url)],
    postsIndexSchema,
  );

  await validateJsonFiles(
    "Example post-detail files",
    [new URL("./examples/post-detail-en.json", import.meta.url)],
    postDetailSchema,
  );

  // Validate RSS feed XML files
  const rssFiles = await findOutputFiles(siteDir, /\/feed\.rss$/);
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
  const atomFiles = await findOutputFiles(siteDir, /\/feed\.atom$/);
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
