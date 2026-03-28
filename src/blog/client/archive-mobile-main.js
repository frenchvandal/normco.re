import { createRoot } from "react-dom/client";
import { createElement } from "react";
import {
  BLOG_APP_DATA_ID,
  BLOG_APP_ROOT_ATTRIBUTE,
  BLOG_ARCHIVE_MOBILE_MEDIA_QUERY,
} from "../embed.ts";
import { parseBlogAppData } from "./bootstrap-data.ts";
import { BlogAntdArchiveMobileApp } from "./ArchiveMobileApp.jsx";

const rootElement = document.querySelector(`[${BLOG_APP_ROOT_ATTRIBUTE}]`);
const dataElement = document.getElementById(BLOG_APP_DATA_ID);

if (
  rootElement &&
  dataElement?.textContent &&
  globalThis.matchMedia(BLOG_ARCHIVE_MOBILE_MEDIA_QUERY).matches
) {
  const data = parseBlogAppData(dataElement.textContent);

  if (data?.view === "archive") {
    createRoot(rootElement).render(
      createElement(BlogAntdArchiveMobileApp, { data }),
    );
  }
}
