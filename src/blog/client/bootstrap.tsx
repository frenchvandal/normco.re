import { createRoot } from "react-dom/client";
import type { FunctionComponent } from "react";
import { BLOG_APP_DATA_ID, BLOG_APP_ROOT_ATTRIBUTE } from "../embed.ts";

type MountableProps<TData> = Readonly<{
  data: TData;
}>;

export function mountBlogApp<TData>(
  App: FunctionComponent<MountableProps<TData>>,
): void {
  const rootElement = document.querySelector<HTMLElement>(
    `[${BLOG_APP_ROOT_ATTRIBUTE}]`,
  );
  const dataElement = document.getElementById(BLOG_APP_DATA_ID);

  if (!rootElement || !dataElement?.textContent) {
    return;
  }

  const data = JSON.parse(dataElement.textContent) as TData;
  createRoot(rootElement).render(<App data={data} />);
}
