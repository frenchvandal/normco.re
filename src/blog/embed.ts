import type { BlogAppViewData } from "./view-data.ts";

export const BLOG_APP_DATA_ID = "blog-antd-data";
export const BLOG_APP_ROOT_ATTRIBUTE = "data-blog-antd-root";
export const BLOG_ARCHIVE_SCRIPT_SRC = "/scripts/blog-antd-archive.js";
export const BLOG_TAG_SCRIPT_SRC = "/scripts/blog-antd-tag.js";
export const BLOG_POST_SCRIPT_SRC = "/scripts/blog-antd-post.js";

export function serializeJsonForHtml(value: unknown): string {
  return JSON.stringify(value)
    .replaceAll("<", "\\u003C")
    .replaceAll(">", "\\u003E")
    .replaceAll("&", "\\u0026")
    .replaceAll("\u2028", "\\u2028")
    .replaceAll("\u2029", "\\u2029");
}

function resolveBlogAppScriptSrc(data: BlogAppViewData): string {
  switch (data.view) {
    case "archive":
      return BLOG_ARCHIVE_SCRIPT_SRC;
    case "tag":
      return BLOG_TAG_SCRIPT_SRC;
    case "post":
      return BLOG_POST_SCRIPT_SRC;
  }
}

export function renderBlogAppBootstrap(data: BlogAppViewData): string {
  const scriptSrc = resolveBlogAppScriptSrc(data);

  return `<script type="application/json" id="${BLOG_APP_DATA_ID}">${
    serializeJsonForHtml(data)
  }</script>
<script src="${scriptSrc}" type="module" fetchpriority="low" defer></script>`;
}
