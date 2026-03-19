import {
  getLocalizedUrl,
  getSiteTranslations,
  type SiteLanguage,
  SUPPORTED_LANGUAGES,
} from "../utils/i18n.ts";

export type HeaderNavigationItem = Readonly<{
  href: string;
  label: string;
  isCurrent: boolean;
}>;

const HOME_URLS = new Set(
  SUPPORTED_LANGUAGES.map((language) => getLocalizedUrl("/", language)),
);

export function normalizeUrlPath(path: string): string {
  const pathname = path.split(/[?#]/, 1)[0] || "/";
  return pathname.endsWith("/") ? pathname : `${pathname}/`;
}

export function ariaCurrent(
  href: string,
  currentUrl: string,
): { readonly "aria-current"?: "page" } {
  const normalizedHref = normalizeUrlPath(href);
  const normalizedCurrentUrl = normalizeUrlPath(currentUrl);

  if (normalizedHref === normalizedCurrentUrl) {
    return { "aria-current": "page" };
  }

  if (HOME_URLS.has(normalizedHref)) {
    return {};
  }

  if (normalizedCurrentUrl.startsWith(normalizedHref)) {
    return { "aria-current": "page" };
  }

  return {};
}

export function buildHeaderNavigation(
  {
    currentUrl,
    language,
  }: {
    readonly currentUrl: string;
    readonly language: SiteLanguage;
  },
): readonly HeaderNavigationItem[] {
  const translations = getSiteTranslations(language);
  const homeUrl = getLocalizedUrl("/", language);
  const postsUrl = getLocalizedUrl("/posts/", language);
  const tagsUrl = getLocalizedUrl("/tags/", language);
  const aboutUrl = getLocalizedUrl("/about/", language);

  return [
    {
      href: homeUrl,
      label: translations.navigation.home,
      isCurrent: ariaCurrent(homeUrl, currentUrl)["aria-current"] === "page",
    },
    {
      href: postsUrl,
      label: translations.navigation.writing,
      isCurrent: ariaCurrent(postsUrl, currentUrl)["aria-current"] ===
          "page" ||
        ariaCurrent(tagsUrl, currentUrl)["aria-current"] === "page",
    },
    {
      href: aboutUrl,
      label: translations.navigation.about,
      isCurrent: ariaCurrent(aboutUrl, currentUrl)["aria-current"] === "page",
    },
  ] as const;
}
