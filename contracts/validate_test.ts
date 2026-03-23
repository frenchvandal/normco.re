import { assertEquals, assertRejects } from "@std/assert";
import { describe, it } from "@std/testing/bdd";

import {
  createOutputFilePattern,
  readJsonFile,
  readSchemaFile,
  validate,
  validateAtomFeed,
  validateRssFeed,
} from "./validate.ts";
import { withPatchedDeno } from "../test/mock_deno.ts";

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

  it("enforces enum values declared in the schema", () => {
    const schema = {
      type: "object",
      properties: {
        lang: {
          type: "string",
          enum: ["en", "fr"],
        },
      },
    };

    const validErrors = validate({ lang: "en" }, schema, schema, "$");
    const invalidErrors = validate({ lang: "zh-hans" }, schema, schema, "$");

    assertEquals(validErrors, []);
    assertEquals(invalidErrors, [{
      path: "$.lang",
      message: 'Expected one of ["en","fr"], got "zh-hans"',
    }]);
  });

  it("rejects unexpected object properties when additionalProperties is false", () => {
    const schema = {
      type: "object",
      additionalProperties: false,
      properties: {
        title: { type: "string" },
      },
    };

    const validErrors = validate(
      { title: "Valid title" },
      schema,
      schema,
      "$",
    );
    const invalidErrors = validate(
      { title: "Valid title", extra: true },
      schema,
      schema,
      "$",
    );

    assertEquals(validErrors, []);
    assertEquals(invalidErrors, [{
      path: "$.extra",
      message: "Unexpected property",
    }]);
  });
});

describe("createOutputFilePattern()", () => {
  it("matches root and localized output files by public path suffix", () => {
    const rssPattern = createOutputFilePattern("/rss.xml");
    const atomPattern = createOutputFilePattern("/atom.xml");

    assertEquals(rssPattern.test("_site/rss.xml"), true);
    assertEquals(rssPattern.test("_site/fr/rss.xml"), true);
    assertEquals(rssPattern.test("_site/feed.rss"), false);

    assertEquals(atomPattern.test("_site/atom.xml"), true);
    assertEquals(atomPattern.test("_site/zh-hans/atom.xml"), true);
    assertEquals(atomPattern.test("_site/feed.atom"), false);
  });
});

describe("readJsonFile()", () => {
  it("reads valid JSON files", async () => {
    await withPatchedDeno({
      readTextFile: () => Promise.resolve('{"ok":true}'),
    }, async () => {
      const filePath = "/virtual/valid.json";
      assertEquals(await readJsonFile(filePath), { ok: true });
    });
  });

  it("wraps JSON parse failures with file context", async () => {
    await withPatchedDeno({
      readTextFile: () => Promise.resolve("{"),
    }, async () => {
      const filePath = "/virtual/invalid.json";
      await assertRejects(
        () => readJsonFile(filePath),
        Error,
        `Cannot parse JSON file "${filePath}"`,
      );
    });
  });

  it("wraps missing-file reads with file context", async () => {
    await withPatchedDeno({
      readTextFile: () => Promise.reject(new Deno.errors.NotFound("missing")),
    }, async () => {
      const filePath = "/virtual/missing.json";
      await assertRejects(
        () => readJsonFile(filePath),
        Error,
        `Cannot read JSON file "${filePath}"`,
      );
    });
  });
});

describe("readSchemaFile()", () => {
  it("rejects schema files whose root is not a JSON object", async () => {
    await withPatchedDeno({
      readTextFile: () => Promise.resolve('["not","an","object"]'),
    }, async () => {
      const filePath = "/virtual/schema.json";
      await assertRejects(
        () => readSchemaFile(filePath),
        Error,
        `Schema file "${filePath}" must contain a JSON object at the root`,
      );
    });
  });
});

describe("validateAtomFeed()", () => {
  it("requires feed-level fields even when an entry contains the same tag", () => {
    const errors = validateAtomFeed(
      `<?xml version="1.0" encoding="UTF-8"?><?xml-stylesheet type="text/xsl" href="/feed.xsl"?><feed xmlns="http://www.w3.org/2005/Atom"><title>normco.re</title><updated>2026-03-16T00:00:00Z</updated><author><name>Phiphi</name></author><link rel="self" type="application/atom+xml" href="https://normco.re/atom.xml"/><link rel="alternate" type="text/html" href="https://normco.re/"/><entry><id>https://normco.re/posts/hello/</id><title>Hello</title><updated>2026-03-16T00:00:00Z</updated></entry></feed>`,
    );

    assertEquals(errors.some((error) => error.path === "$.feed.id"), true);
  });

  it("rejects raw child markup inside content[type=html]", () => {
    const errors = validateAtomFeed(
      `<?xml version="1.0" encoding="UTF-8"?><?xml-stylesheet type="text/xsl" href="/feed.xsl"?><feed xmlns="http://www.w3.org/2005/Atom"><id>https://normco.re/atom.xml</id><title>normco.re</title><updated>2026-03-16T00:00:00Z</updated><author><name>Phiphi</name></author><link rel="self" type="application/atom+xml" href="https://normco.re/atom.xml"/><link rel="alternate" type="text/html" href="https://normco.re/"/><entry><id>https://normco.re/posts/hello/</id><title>Hello</title><updated>2026-03-16T00:00:00Z</updated><content type="html"><p>Raw HTML</p></content></entry></feed>`,
    );

    assertEquals(
      errors.some((error) => error.path === "$.feed.entry[0].content"),
      true,
    );
  });
});

describe("validateRssFeed()", () => {
  it("requires a channel-level link even when an item contains one", () => {
    const errors = validateRssFeed(
      `<?xml version="1.0" encoding="UTF-8"?><?xml-stylesheet type="text/xsl" href="/feed.xsl"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>normco.re</title><description>Personal blog</description><language>en</language><lastBuildDate>Tue, 16 Mar 2026 00:00:00 GMT</lastBuildDate><atom:link rel="self" type="application/rss+xml" href="https://normco.re/rss.xml"/><item><title>Hello</title><link>https://normco.re/posts/hello/</link><guid>https://normco.re/posts/hello/</guid><pubDate>Tue, 16 Mar 2026 00:00:00 GMT</pubDate></item></channel></rss>`,
    );

    assertEquals(
      errors.some((error) => error.path === "$.rss.channel.link"),
      true,
    );
  });
});
