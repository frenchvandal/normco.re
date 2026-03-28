import type { BlogAppViewData } from "./view-data.ts";

export const BLOG_APP_DATA_ID = "blog-antd-data";
export const BLOG_APP_ROOT_ATTRIBUTE = "data-blog-antd-root";
export const BLOG_ARCHIVE_SCRIPT_SRC = "/scripts/blog-antd-archive.js";
export const BLOG_TAG_SCRIPT_SRC = "/scripts/blog-antd-tag.js";
export const BLOG_POST_SCRIPT_SRC = "/scripts/blog-antd-post.js";
export const BLOG_ARCHIVE_MOBILE_MEDIA_QUERY = "(max-width: 63.99rem)";

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
  const loader = data.view === "archive"
    ? `{
  const mediaQuery = window.matchMedia(${
      serializeJsonForHtml(BLOG_ARCHIVE_MOBILE_MEDIA_QUERY)
    });
  let loaded = false;
  const load = () => {
    if (loaded) {
      return;
    }

    loaded = true;
    void import(${serializeJsonForHtml(scriptSrc)});
  };

  if (mediaQuery.matches) {
    load();
  } else if (typeof mediaQuery.addEventListener === "function") {
    mediaQuery.addEventListener("change", (event) => {
      if (event.matches) {
        load();
      }
    }, { once: true });
  } else if (typeof mediaQuery.addListener === "function") {
    const listener = (event) => {
      if (!event.matches) {
        return;
      }

      mediaQuery.removeListener(listener);
      load();
    };

    mediaQuery.addListener(listener);
  }
}`
    : `void import(${serializeJsonForHtml(scriptSrc)});`;

  return `<script type="application/json" id="${BLOG_APP_DATA_ID}">${
    serializeJsonForHtml(data)
  }</script>
<script type="module">${loader}</script>`;
}
