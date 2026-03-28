import React from "react";
import { extractStyle } from "npm:@ant-design/static-style-extract@2.1.0";
import {
  Breadcrumb,
  Button,
  Calendar,
  Card,
  Col,
  ConfigProvider,
  Descriptions,
  Divider,
  Empty,
  Flex,
  FloatButton,
  Progress,
  Row,
  Space,
  Statistic,
  Tag,
  Timeline,
  Tooltip,
  Typography,
} from "antd";
import { dirname, fromFileUrl, join } from "@std/path";
import { BLOG_ANTD_THEME } from "../src/blog/client/theme.ts";

const SCRIPT_DIR = dirname(fromFileUrl(import.meta.url));
const REPO_ROOT = join(SCRIPT_DIR, "..");
const OUTPUT_PATH = join(
  REPO_ROOT,
  "src/styles/generated/blog-antd-components.css",
);
const EXTRACT_WARNING_PREFIXES = [
  "Warning: [antd: Input.Group]",
  "Warning: [antd: List]",
] as const;

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

function createStyleSeed() {
  return React.createElement(
    "div",
    null,
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
          React.createElement(Typography.Title, { level: 1 }, "Articles"),
          React.createElement(
            Typography.Paragraph,
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
      React.createElement(Typography.Paragraph, null, "Lead summary."),
      React.createElement(Progress, {
        percent: 48,
        size: "small",
        showInfo: false,
      }),
    ),
    React.createElement(
      Card,
      { title: "Article card" },
      React.createElement(Typography.Paragraph, null, "Summary copy."),
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
    React.createElement(Calendar, {
      fullscreen: false,
      mode: "year",
    }),
    React.createElement(
      Tooltip,
      {
        color: "geekblue",
        title: "March 2026",
      },
      React.createElement("span", null, "Month"),
    ),
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
    React.createElement(FloatButton.BackTop, { visibilityHeight: 200 }),
  );
}

if (import.meta.main) {
  await Deno.mkdir(dirname(OUTPUT_PATH), { recursive: true });

  const css = withSuppressedExtractWarnings(() =>
    extractStyle((node) =>
      React.createElement(
        ConfigProvider,
        { theme: BLOG_ANTD_THEME },
        React.createElement(React.Fragment, null, node, createStyleSeed()),
      )
    )
  );

  await Deno.writeTextFile(OUTPUT_PATH, `${css}\n`);
}
