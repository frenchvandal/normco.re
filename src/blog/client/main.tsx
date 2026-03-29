import { createRoot } from "react-dom/client";
import { createElement } from "react";
import type { BlogAppViewData } from "../view-data.ts";
import { BLOG_APP_DATA_ID, BLOG_APP_ROOT_ATTRIBUTE } from "../embed.ts";
import BlogAntdApp from "./App.tsx";
import { isBlogAppViewData, parseBlogAppData } from "./bootstrap-data.ts";

const rootElement = document.querySelector<HTMLElement>(
  `[${BLOG_APP_ROOT_ATTRIBUTE}]`,
);
const dataElement = document.getElementById(BLOG_APP_DATA_ID);

if (rootElement && dataElement?.textContent) {
  const data = parseBlogAppData<BlogAppViewData>(
    dataElement.textContent,
    isBlogAppViewData,
  );

  if (data) {
    createRoot(rootElement).render(createElement(BlogAntdApp, { data }));
  }
}
