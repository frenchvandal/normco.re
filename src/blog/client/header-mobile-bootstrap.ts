import { HEADER_IDS } from "../../utils/header-language-menu.ts";
import {
  HEADER_MOBILE_TABBAR_DATA_ID,
  HEADER_MOBILE_TABBAR_MEDIA_QUERY,
  HEADER_MOBILE_TABBAR_ROOT_ID,
  type HeaderMobileTabBarData,
} from "../../utils/header-mobile-tabbar.ts";

type BootTargetWindow = typeof globalThis & {
  document?: Document;
  matchMedia?: (query: string) => MediaQueryList;
  console?: Pick<Console, "error">;
  HTMLElement?: typeof HTMLElement;
};

export type PreparedHeaderMobileTabBar = Readonly<{
  data: HeaderMobileTabBarData;
  rootElement: HTMLElement;
}>;

export function prepareHeaderMobileTabBar(
  targetWindow: BootTargetWindow = globalThis,
): PreparedHeaderMobileTabBar | undefined {
  const { document, HTMLElement } = targetWindow;
  const rootElement = document?.getElementById(HEADER_MOBILE_TABBAR_ROOT_ID);
  const dataElement = document?.getElementById(HEADER_MOBILE_TABBAR_DATA_ID);
  const mediaQuery = targetWindow.matchMedia?.(
    HEADER_MOBILE_TABBAR_MEDIA_QUERY,
  );

  if (
    !rootElement ||
    !dataElement?.textContent ||
    !mediaQuery?.matches ||
    !(rootElement instanceof HTMLElement)
  ) {
    return undefined;
  }

  try {
    const data = JSON.parse(dataElement.textContent) as HeaderMobileTabBarData;
    const menuToggle = document.querySelector(
      `[aria-controls="${HEADER_IDS.sideNav}"]`,
    );
    const sideNav = document.getElementById(HEADER_IDS.sideNav);

    if (menuToggle instanceof HTMLElement) {
      menuToggle.setAttribute("aria-expanded", "false");
    }

    if (sideNav instanceof HTMLElement) {
      sideNav.hidden = true;
      sideNav.removeAttribute("expanded");
    }

    document.documentElement.dataset.mobileTabbarReady = "true";
    rootElement.hidden = false;

    return { data, rootElement };
  } catch (error) {
    targetWindow.console?.error?.(
      "[header-mobile-tabbar] Failed to parse bootstrap data.",
      { error },
    );
    return undefined;
  }
}
