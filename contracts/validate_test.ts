import { assertEquals, assertRejects } from "jsr/assert";
import { describe, it } from "jsr/testing-bdd";

import { readJsonFile, readSchemaFile, validate } from "./validate.ts";

describe("validate()", () => {
  it("reports invalid schema patterns instead of throwing", () => {
    const schema = { type: "string", pattern: "[" };

    const errors = validate("example", schema, schema, "$.title");

    assertEquals(errors.length, 1);
    assertEquals(errors[0]?.path, "$.title");
    assertEquals(
      errors[0]?.message.startsWith('Invalid schema pattern "["'),
      true,
    );
  });

  it("resolves local $ref targets and validates nested object requirements", () => {
    const schema = {
      type: "object",
      required: ["post"],
      properties: {
        post: { $ref: "#/$defs/post" },
      },
      $defs: {
        post: {
          type: "object",
          required: ["title"],
          properties: {
            title: { type: "string", minLength: 3 },
          },
        },
      },
    };

    const validErrors = validate(
      { post: { title: "Valid title" } },
      schema,
      schema,
      "$",
    );
    const invalidErrors = validate(
      { post: { title: "no" } },
      schema,
      schema,
      "$",
    );

    assertEquals(validErrors, []);
    assertEquals(invalidErrors, [{
      path: "$.post.title",
      message: "String too short (min 3)",
    }]);
  });

  it("validates oneOf branches and array items with precise paths", () => {
    const schema = {
      type: "object",
      properties: {
        blocks: {
          type: "array",
          items: {
            oneOf: [
              { type: "string" },
              { type: "integer", minimum: 1 },
            ],
          },
        },
      },
    };

    const validErrors = validate(
      { blocks: ["intro", 2] },
      schema,
      schema,
      "$",
    );
    const invalidErrors = validate(
      { blocks: [0] },
      schema,
      schema,
      "$",
    );

    assertEquals(validErrors, []);
    assertEquals(invalidErrors, [{
      path: "$.blocks[0]",
      message: "Does not match any oneOf variant",
    }]);
  });
});

describe("readJsonFile()", () => {
  it("reads valid JSON files", async () => {
    const dir = await Deno.makeTempDir();
    const filePath = `${dir}/valid.json`;

    try {
      await Deno.writeTextFile(filePath, '{"ok":true}');
      assertEquals(await readJsonFile(filePath), { ok: true });
    } finally {
      await Deno.remove(dir, { recursive: true });
    }
  });

  it("wraps JSON parse failures with file context", async () => {
    const dir = await Deno.makeTempDir();
    const filePath = `${dir}/invalid.json`;

    try {
      await Deno.writeTextFile(filePath, "{");
      await assertRejects(
        () => readJsonFile(filePath),
        Error,
        `Cannot parse JSON file "${filePath}"`,
      );
    } finally {
      await Deno.remove(dir, { recursive: true });
    }
  });

  it("wraps missing-file reads with file context", async () => {
    const dir = await Deno.makeTempDir();
    const filePath = `${dir}/missing.json`;

    try {
      await assertRejects(
        () => readJsonFile(filePath),
        Error,
        `Cannot read JSON file "${filePath}"`,
      );
    } finally {
      await Deno.remove(dir, { recursive: true });
    }
  });
});

describe("readSchemaFile()", () => {
  it("rejects schema files whose root is not a JSON object", async () => {
    const dir = await Deno.makeTempDir();
    const filePath = `${dir}/schema.json`;

    try {
      await Deno.writeTextFile(filePath, '["not","an","object"]');
      await assertRejects(
        () => readSchemaFile(filePath),
        Error,
        `Schema file "${filePath}" must contain a JSON object at the root`,
      );
    } finally {
      await Deno.remove(dir, { recursive: true });
    }
  });
});
