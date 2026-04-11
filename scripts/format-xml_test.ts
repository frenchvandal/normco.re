import { assertEquals, assertRejects } from "@std/assert";
import { join, relative } from "@std/path";

import {
  buildXmllintArgs,
  collectXmlFormatTargets,
  formatXmlFile,
  shouldSkipEntryPath,
} from "./format-xml.ts";

Deno.test("buildXmllintArgs() writes formatted output to the target path", () => {
  assertEquals(
    buildXmllintArgs("input.xml", "output.xml"),
    ["--format", "input.xml", "--output", "output.xml"],
  );
});

Deno.test("collectXmlFormatTargets() discovers XML files and skips ignored directories", async () => {
  const root = await Deno.makeTempDir();

  try {
    await Deno.mkdir(join(root, "nested"), { recursive: true });
    await Deno.mkdir(join(root, "build"), { recursive: true });
    await Deno.writeTextFile(join(root, "keep.xml"), "<keep/>");
    await Deno.writeTextFile(
      join(root, "feed.xsl.template"),
      "<xsl:stylesheet/>",
    );
    await Deno.writeTextFile(join(root, "nested", "child.xml"), "<child/>");
    await Deno.writeTextFile(join(root, "nested", "notes.txt"), "ignore me");
    await Deno.writeTextFile(join(root, "build", "skip.xml"), "<skip/>");

    const targets = await collectXmlFormatTargets(["."], root);

    assertEquals(
      targets.map((target) => relative(root, target)),
      ["feed.xsl.template", "keep.xml", join("nested", "child.xml")],
    );
  } finally {
    await Deno.remove(root, { recursive: true });
  }
});

Deno.test("formatXmlFile() replaces the source file with the formatter output", async () => {
  const root = await Deno.makeTempDir();
  const target = join(root, "sample.xml");

  try {
    await Deno.writeTextFile(target, "<root/>");

    await formatXmlFile(
      target,
      async (_inputPath, outputPath) => {
        await Deno.writeTextFile(outputPath, "<root>\n  <child/>\n</root>\n");
      },
    );

    assertEquals(
      await Deno.readTextFile(target),
      "<root>\n  <child/>\n</root>\n",
    );
  } finally {
    await Deno.remove(root, { recursive: true });
  }
});

Deno.test("formatXmlFile() removes temporary output when formatting fails", async () => {
  const root = await Deno.makeTempDir();
  const target = join(root, "sample.xml");

  try {
    await Deno.writeTextFile(target, "<root/>");

    await assertRejects(
      () =>
        formatXmlFile(
          target,
          async (_inputPath, outputPath) => {
            await Deno.writeTextFile(outputPath, "<broken/>");
            throw new Error("boom");
          },
        ),
      Error,
      "boom",
    );

    assertEquals(await Deno.readTextFile(target), "<root/>");

    const remainingEntries: string[] = [];
    for await (const entry of Deno.readDir(root)) {
      remainingEntries.push(entry.name);
    }

    assertEquals(remainingEntries, ["sample.xml"]);
  } finally {
    await Deno.remove(root, { recursive: true });
  }
});

Deno.test("shouldSkipEntryPath() matches ignored directory names", () => {
  assertEquals(
    shouldSkipEntryPath("/repo/apps/android/build/values.xml"),
    true,
  );
  assertEquals(shouldSkipEntryPath("/repo/src/posts/sample.xml"), false);
});
