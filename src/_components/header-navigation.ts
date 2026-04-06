import {
  getLocalizedUrl,
  getPageContext,
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

function isCurrentPage(href: string, currentUrl: string): boolean {
  return ariaCurrent(href, currentUrl)["aria-current"] === "page";
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
  const {
    aboutUrl,
    archiveUrl: postsUrl,
    galleryUrl,
    homeUrl,
    tagsUrl,
    translations,
  } = getPageContext(language);

  return [
    {
      href: homeUrl,
      label: translations.navigation.home,
      isCurrent: isCurrentPage(homeUrl, currentUrl),
    },
    {
      href: postsUrl,
      label: translations.navigation.writing,
      isCurrent: isCurrentPage(postsUrl, currentUrl) ||
        isCurrentPage(tagsUrl, currentUrl),
    },
    {
      href: galleryUrl,
      label: translations.navigation.gallery,
      isCurrent: isCurrentPage(galleryUrl, currentUrl),
    },
    {
      href: aboutUrl,
      label: translations.navigation.about,
      isCurrent: isCurrentPage(aboutUrl, currentUrl),
    },
  ] as const;
}
