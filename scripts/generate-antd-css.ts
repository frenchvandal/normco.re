import React from "react";
import { extractStyle } from "npm:@ant-design/static-style-extract@2.1.0";
import {
  Breadcrumb,
  Button,
  Card,
  Col,
  ConfigProvider,
  Descriptions,
  Divider,
  Empty,
  Flex,
  FloatButton,
  Menu,
  Progress,
  Row,
  Space,
  Statistic,
  Tag,
  Timeline,
  Typography,
} from "antd";
import { dirname, fromFileUrl, join } from "@std/path";
import { BLOG_ANTD_THEME } from "../src/blog/client/theme.ts";

const SCRIPT_DIR = dirname(fromFileUrl(import.meta.url));
const REPO_ROOT = join(SCRIPT_DIR, "..");
const OUTPUT_PATH = join(
  REPO_ROOT,
  "src/styles/generated/antd-components.css",
);
const EXTRACT_WARNING_PREFIXES = [
  "Warning: [antd: Input.Group]",
  "Warning: [antd: List]",
] as const;

async function formatOutputFile(filePath: string): Promise<void> {
  const command = new Deno.Command(Deno.execPath(), {
    args: ["fmt", filePath],
    stdout: "null",
    stderr: "inherit",
  });
  const { success } = await command.output();

  if (!success) {
    throw new Error(`Failed to format generated stylesheet: ${filePath}`);
  }
}

function withSuppressedExtractWarnings<T>(run: () => T): T {
  const originalWarn = console.warn;
  const originalError = console.error;

  const writeIfNeeded = (
    original: (...args: unknown[]) => void,
    args: unknown[],
  ) => {
    const [first] = args;
    const message = typeof first === "string" ? first : "";

    if (
      EXTRACT_WARNING_PREFIXES.some((prefix) => message.startsWith(prefix))
    ) {
      return;
    }

    original(...args);
  };

  console.warn = (...args: unknown[]) => {
    writeIfNeeded(originalWarn, args);
  };
  console.error = (...args: unknown[]) => {
    writeIfNeeded(originalError, args);
  };

  try {
    return run();
  } finally {
    console.warn = originalWarn;
    console.error = originalError;
  }
}

function createSiteSeed() {
  return React.createElement(Menu, {
    className: "site-header-antd-menu",
    mode: "horizontal",
    selectedKeys: ["/posts/"],
    style: { minWidth: 0, flex: "auto" },
    items: [
      { key: "/", label: "Home" },
      { key: "/posts/", label: "Articles" },
      { key: "/about/", label: "About" },
    ],
  });
}

function createBlogSeed() {
  const BackTop = FloatButton.BackTop;
  const { Paragraph, Title } = Typography;

  return React.createElement(
    "div",
    { className: "blog-antd-root" },
    React.createElement(Breadcrumb, {
      items: [{ title: "Home" }, { title: "Articles" }],
    }),
    React.createElement(Statistic, {
      title: "Published",
      value: 12,
    }),
    React.createElement(
      Row,
      { gutter: [24, 24] },
      React.createElement(
        Col,
        { span: 16 },
        React.createElement(
          Flex,
          { vertical: true, gap: 12 },
          React.createElement(Title, { level: 1 }, "Articles"),
          React.createElement(
            Paragraph,
            null,
            "A considered archive of writing and shipping notes.",
          ),
        ),
      ),
      React.createElement(
        Col,
        { span: 8 },
        React.createElement(
          Flex,
          { vertical: true, gap: 12 },
          React.createElement(Tag, null, "12 published"),
          React.createElement(
            Button,
            { href: "/posts/example/" },
            "Latest dispatch",
          ),
        ),
      ),
    ),
    React.createElement(
      Card,
      { title: "Feature card" },
      React.createElement(Paragraph, null, "Lead summary."),
      React.createElement(Progress, {
        percent: 48,
        size: "small",
        showInfo: false,
      }),
    ),
    React.createElement(
      Card,
      { title: "Article card" },
      React.createElement(Paragraph, null, "Summary copy."),
      React.createElement(Button, { href: "/posts/example/" }, "Read article"),
    ),
    React.createElement(
      Space,
      { wrap: true },
      React.createElement(Tag, null, "Design"),
      React.createElement(Tag, null, "Writing"),
    ),
    React.createElement(Descriptions, {
      column: 1,
      items: [{
        key: "published",
        label: "Published",
        children: "2026-03-28",
      }],
    }),
    React.createElement(Divider, null),
    React.createElement(Timeline, {
      items: [
        { content: "Introduction" },
        { content: "Implementation" },
      ],
    }),
    React.createElement(Empty, {
      description: "No articles yet.",
      image: Empty.PRESENTED_IMAGE_SIMPLE,
    }),
    React.createElement(BackTop, { visibilityHeight: 200 }),
  );
}

if (import.meta.main) {
  await Deno.mkdir(dirname(OUTPUT_PATH), { recursive: true });

  const css = withSuppressedExtractWarnings(() =>
    extractStyle((node) =>
      React.createElement(
        ConfigProvider,
        { theme: BLOG_ANTD_THEME },
        React.createElement(
          React.Fragment,
          null,
          node,
          createSiteSeed(),
          createBlogSeed(),
        ),
      )
    )
  );

  await Deno.writeTextFile(OUTPUT_PATH, `${css}\n`);
  await formatOutputFile(OUTPUT_PATH);
}
