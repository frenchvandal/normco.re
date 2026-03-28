import "antd-mobile/global";
import { createElement } from "react";
import { createRoot } from "react-dom/client";
import { prepareHeaderMobileTabBar } from "./header-mobile-bootstrap.ts";
import { HeaderMobileTabBar } from "./HeaderMobileTabBar.jsx";

export function bootHeaderMobileTabBar(targetWindow = globalThis) {
  const prepared = prepareHeaderMobileTabBar(targetWindow);
  if (!prepared) {
    return false;
  }

  createRoot(prepared.rootElement).render(
    createElement(HeaderMobileTabBar, { data: prepared.data }),
  );

  return true;
}

if (typeof window !== "undefined" && typeof document !== "undefined") {
  bootHeaderMobileTabBar(window);
}
