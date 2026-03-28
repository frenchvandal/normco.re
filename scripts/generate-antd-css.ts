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
const GENERATED_TOKEN_REPLACEMENTS = [
  [
    "--ant-calendar-item-active-bg: #404040;",
    "--ant-calendar-item-active-bg: var(--ph-surface-accent-strong);",
  ],
  [
    "--ant-calendar-cell-active-with-range-bg: #404040;",
    "--ant-calendar-cell-active-with-range-bg: var(--ph-surface-accent-strong);",
  ],
  [
    "--ant-calendar-cell-hover-with-range-bg: #595959;",
    "--ant-calendar-cell-hover-with-range-bg: var(--ph-surface-accent);",
  ],
  [
    "--ant-calendar-cell-range-border-color: #333333;",
    "--ant-calendar-cell-range-border-color: var(--ph-color-accent-emphasis);",
  ],
  [
    "--ant-cascader-option-selected-bg: #404040;",
    "--ant-cascader-option-selected-bg: var(--ph-surface-accent-strong);",
  ],
  [
    "--ant-form-label-required-mark-color: #ff4d4f;",
    "--ant-form-label-required-mark-color: var(--ph-color-feedback-error);",
  ],
  [
    "--ant-input-active-border-color: #000000;",
    "--ant-input-active-border-color: var(--ph-color-accent-fg);",
  ],
  [
    "--ant-input-number-active-border-color: #000000;",
    "--ant-input-number-active-border-color: var(--ph-color-accent-fg);",
  ],
  [
    "--ant-input-number-filled-handle-bg: #000000;",
    "--ant-input-number-filled-handle-bg: var(--ph-color-accent-fg);",
  ],
  [
    "--ant-input-number-handle-hover-color: #000000;",
    "--ant-input-number-handle-hover-color: var(--ph-color-accent-fg);",
  ],
  [
    "--ant-layout-color-bg-body: #f5f5f5;",
    "--ant-layout-color-bg-body: var(--ph-color-canvas-subtle);",
  ],
  [
    "--ant-layout-body-bg: #f5f5f5;",
    "--ant-layout-body-bg: var(--ph-color-canvas-subtle);",
  ],
  [
    "--ant-layout-footer-bg: #f5f5f5;",
    "--ant-layout-footer-bg: var(--ph-color-canvas-subtle);",
  ],
  [
    "--ant-button-primary-color: #fff;",
    "--ant-button-primary-color: var(--ph-color-canvas-default);",
  ],
  [
    "--ant-button-danger-color: #fff;",
    "--ant-button-danger-color: var(--ph-color-canvas-default);",
  ],
  [
    "--ant-color-primary: #000000;",
    "--ant-color-primary: var(--ph-color-accent-fg);",
  ],
  [
    "--ant-color-success: #52c41a;",
    "--ant-color-success: var(--ph-color-feedback-success);",
  ],
  [
    "--ant-color-warning: #faad14;",
    "--ant-color-warning: var(--ph-color-feedback-warning);",
  ],
  [
    "--ant-color-error: #ff4d4f;",
    "--ant-color-error: var(--ph-color-feedback-error);",
  ],
  [
    "--ant-color-info: #1677ff;",
    "--ant-color-info: var(--ph-color-feedback-info);",
  ],
  [
    "--ant-color-link: #000000;",
    "--ant-color-link: var(--ph-color-accent-fg);",
  ],
  [
    "--ant-color-text-base: #000;",
    "--ant-color-text-base: var(--ph-color-fg-default);",
  ],
  [
    "--ant-color-bg-base: #fff;",
    "--ant-color-bg-base: var(--ph-color-canvas-default);",
  ],
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

function alignGeneratedTokens(css: string): string {
  return GENERATED_TOKEN_REPLACEMENTS.reduce(
    (result, [from, to]) => result.replaceAll(from, to),
    css,
  );
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
          createBlogSeed(),
        ),
      )
    )
  );

  await Deno.writeTextFile(OUTPUT_PATH, `${alignGeneratedTokens(css)}\n`);
  await formatOutputFile(OUTPUT_PATH);
}
