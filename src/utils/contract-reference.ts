import appManifestSchema from "../../contracts/app-manifest.schema.json" with {
  type: "json",
};
import postDetailSchema from "../../contracts/post-detail.schema.json" with {
  type: "json",
};
import postsIndexSchema from "../../contracts/posts-index.schema.json" with {
  type: "json",
};

import { getLanguageDataCode, SUPPORTED_LANGUAGES } from "./i18n.ts";
import {
  APP_CONTRACT_VERSION,
  APP_MANIFEST_API_PATH,
  getPostDetailApiPathTemplate,
  POSTS_INDEX_API_PATH,
} from "./mobile-content-contract.ts";

type SchemaNode = {
  readonly $defs?: Readonly<Record<string, SchemaNode>>;
  readonly $id?: string;
  readonly $ref?: string;
  readonly additionalProperties?: boolean;
  readonly const?: unknown;
  readonly description?: string;
  readonly enum?: ReadonlyArray<unknown>;
  readonly format?: string;
  readonly items?: SchemaNode;
  readonly maximum?: number;
  readonly minimum?: number;
  readonly minItems?: number;
  readonly minLength?: number;
  readonly oneOf?: ReadonlyArray<SchemaNode>;
  readonly pattern?: string;
  readonly properties?: Readonly<Record<string, SchemaNode>>;
  readonly required?: ReadonlyArray<string>;
  readonly title?: string;
  readonly type?: string;
};

export type ContractReferenceField = Readonly<{
  constraints: readonly string[];
  name: string;
  required: boolean;
  typeLabel: string;
}>;

export type ContractReferenceDefinition = Readonly<{
  description?: string;
  fields: readonly ContractReferenceField[];
  name: string;
  typeLabel: string;
}>;

export type ContractReference = Readonly<{
  definitions: readonly ContractReferenceDefinition[];
  description: string;
  endpointPaths: readonly string[];
  id: string;
  schemaId?: string;
  title: string;
  topLevelFields: readonly ContractReferenceField[];
}>;

export type MobileContractReferenceData = Readonly<{
  contracts: readonly ContractReference[];
  supportedLanguages: readonly string[];
  version: string;
}>;

function resolveSchemaNode(
  node: SchemaNode,
  root: SchemaNode,
): SchemaNode {
  if (node.$ref === undefined) {
    return node;
  }

  const refPath = node.$ref.replace(/^#\//, "").split("/");
  let current: unknown = root;

  for (const segment of refPath) {
    if (typeof current !== "object" || current === null) {
      return node;
    }

    current = (current as Record<string, unknown>)[segment];
  }

  return typeof current === "object" && current !== null
    ? current as SchemaNode
    : node;
}

function getRefLabel(ref: string): string {
  const segments = ref.split("/");
  return segments[segments.length - 1] ?? ref;
}

function getTypeLabel(node: SchemaNode, root: SchemaNode): string {
  if (node.$ref !== undefined) {
    return getRefLabel(node.$ref);
  }

  if (node.const !== undefined) {
    return JSON.stringify(node.const);
  }

  if (node.enum?.length) {
    return node.enum.map((value) => JSON.stringify(value)).join(" | ");
  }

  if (node.oneOf?.length) {
    return node.oneOf
      .map((variant) => getTypeLabel(variant, root))
      .filter((value, index, values) => values.indexOf(value) === index)
      .join(" | ");
  }

  if (node.type === "array") {
    return `${node.items ? getTypeLabel(node.items, root) : "unknown"}[]`;
  }

  if (node.type !== undefined) {
    return node.type;
  }

  const resolved = resolveSchemaNode(node, root);
  return resolved === node ? "unknown" : getTypeLabel(resolved, root);
}

function getConstraintLabels(
  node: SchemaNode,
  root: SchemaNode,
): readonly string[] {
  const resolved = resolveSchemaNode(node, root);
  const constraints: string[] = [];

  if (resolved.format === "date-time") {
    constraints.push("RFC 3339");
  } else if (resolved.format === "uri") {
    constraints.push("absolute URI");
  } else if (typeof resolved.format === "string") {
    constraints.push(`format: ${resolved.format}`);
  }

  if (resolved.pattern === "^/") {
    constraints.push("starts with /");
  } else if (typeof resolved.pattern === "string") {
    constraints.push(`pattern: ${resolved.pattern}`);
  }

  if (typeof resolved.minLength === "number") {
    constraints.push(`minLength ${resolved.minLength}`);
  }

  if (typeof resolved.minItems === "number") {
    constraints.push(`minItems ${resolved.minItems}`);
  }

  if (typeof resolved.minimum === "number") {
    constraints.push(`min ${resolved.minimum}`);
  }

  if (typeof resolved.maximum === "number") {
    constraints.push(`max ${resolved.maximum}`);
  }

  if (resolved.additionalProperties === false) {
    constraints.push("closed object");
  }

  return constraints;
}

function getObjectFields(
  node: SchemaNode,
  root: SchemaNode,
): readonly ContractReferenceField[] {
  const resolved = resolveSchemaNode(node, root);
  const properties = resolved.properties;
  const requiredFields = new Set(resolved.required ?? []);

  if (!properties) {
    return [];
  }

  return Object.entries(properties).map(([name, field]) => ({
    name,
    required: requiredFields.has(name),
    typeLabel: getTypeLabel(field, root),
    constraints: getConstraintLabels(field, root),
  }));
}

function getDefinitions(
  schema: SchemaNode,
): readonly ContractReferenceDefinition[] {
  return Object.entries(schema.$defs ?? {}).map(([name, definition]) => ({
    name,
    typeLabel: getTypeLabel(definition, schema),
    ...(definition.description ? { description: definition.description } : {}),
    fields: getObjectFields(definition, schema),
  }));
}

function createContractReference(
  id: string,
  schema: SchemaNode,
  endpointPaths: readonly string[],
): ContractReference {
  return {
    id,
    title: schema.title ?? id,
    description: schema.description ?? "",
    endpointPaths,
    ...(schema.$id ? { schemaId: schema.$id } : {}),
    topLevelFields: getObjectFields(schema, schema),
    definitions: getDefinitions(schema),
  };
}

function getLocalizedPostsIndexPaths(): readonly string[] {
  return SUPPORTED_LANGUAGES.map((language) =>
    language === "en"
      ? POSTS_INDEX_API_PATH
      : `/${getLanguageDataCode(language)}${POSTS_INDEX_API_PATH}`
  );
}

function getLocalizedPostDetailPaths(): readonly string[] {
  return SUPPORTED_LANGUAGES.map((language) =>
    getPostDetailApiPathTemplate(language)
  );
}

export function getMobileContractReferenceData(): MobileContractReferenceData {
  return {
    version: APP_CONTRACT_VERSION,
    supportedLanguages: SUPPORTED_LANGUAGES.map((language) =>
      getLanguageDataCode(language)
    ),
    contracts: [
      createContractReference(
        "app-manifest",
        appManifestSchema as SchemaNode,
        [APP_MANIFEST_API_PATH],
      ),
      createContractReference(
        "posts-index",
        postsIndexSchema as SchemaNode,
        getLocalizedPostsIndexPaths(),
      ),
      createContractReference(
        "post-detail",
        postDetailSchema as SchemaNode,
        getLocalizedPostDetailPaths(),
      ),
    ],
  };
}
