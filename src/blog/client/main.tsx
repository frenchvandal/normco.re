import { createRoot } from "react-dom/client";
import type { BlogAppViewData } from "../view-data.ts";
import { BLOG_APP_DATA_ID, BLOG_APP_ROOT_ATTRIBUTE } from "../embed.ts";
import BlogAntdApp from "./App.tsx";

const rootElement = document.querySelector<HTMLElement>(
  `[${BLOG_APP_ROOT_ATTRIBUTE}]`,
);
const dataElement = document.getElementById(BLOG_APP_DATA_ID);

if (rootElement && dataElement?.textContent) {
  const data = JSON.parse(dataElement.textContent) as BlogAppViewData;
  createRoot(rootElement).render(<BlogAntdApp data={data} />);
}
