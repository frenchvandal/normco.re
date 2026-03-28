import React from "react";
import { extractStyle } from "npm:@ant-design/static-style-extract@2.1.0";
import { ConfigProvider, Menu } from "antd";
import { dirname, fromFileUrl, join } from "@std/path";
import { BLOG_ANTD_THEME } from "../src/blog/client/theme.ts";

const SCRIPT_DIR = dirname(fromFileUrl(import.meta.url));
const REPO_ROOT = join(SCRIPT_DIR, "..");
const OUTPUT_PATH = join(
  REPO_ROOT,
  "src/styles/generated/site-antd-components.css",
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
