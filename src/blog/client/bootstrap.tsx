import { createRoot } from "npm/react-dom/client";
import { createElement, type FunctionComponent } from "npm/react";

import { BLOG_APP_DATA_ID, BLOG_APP_ROOT_ATTRIBUTE } from "../embed.ts";
import {
  type BlogAppDataValidator,
  parseBlogAppData,
} from "./bootstrap-data.ts";

type MountableProps<TData> = Readonly<{
  data: TData;
}>;

export function mountBlogApp<TData>(
  App: FunctionComponent<MountableProps<TData>>,
  isExpectedData: BlogAppDataValidator<TData>,
): void {
  const rootElement = document.querySelector<HTMLElement>(
    `[${BLOG_APP_ROOT_ATTRIBUTE}]`,
  );
  const dataElement = document.getElementById(BLOG_APP_DATA_ID);

  if (!rootElement || !dataElement?.textContent) {
    return;
  }

  const data = parseBlogAppData<TData>(dataElement.textContent, isExpectedData);

  if (!data) {
    return;
  }

  createRoot(rootElement).render(createElement(App, { data }));
}
