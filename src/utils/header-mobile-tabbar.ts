import type { HeaderNavigationItem } from "../_components/header-navigation.ts";

export const HEADER_MOBILE_TABBAR_ROOT_ID = "site-mobile-tabbar-root";
export const HEADER_MOBILE_TABBAR_DATA_ID = "site-mobile-tabbar-data";
export const HEADER_MOBILE_TABBAR_SCRIPT_SRC =
  "/scripts/header-mobile-tabbar.js";
export const HEADER_MOBILE_TABBAR_MEDIA_QUERY = "(max-width: 63.99rem)";

export type HeaderMobileTabBarData = Readonly<{
  ariaLabel: string;
  items: readonly HeaderNavigationItem[];
}>;
