import type { jsx } from "lume/jsx-runtime";

import {
  APP_MANIFEST_MIME_TYPE,
  APP_MANIFEST_PATH,
  type SiteChromeData,
} from "../../utils/site-manifest.ts";
import {
  DEFAULT_LANGUAGE,
  getLanguageTag,
  getLocalizedUrl,
  type SiteLanguage,
  SUPPORTED_LANGUAGES,
  tryResolveSiteLanguage,
} from "../../utils/i18n.ts";
import { resolvePageSetup } from "../../utils/page-setup.ts";
import type { IconResolver } from "../../utils/primer-icons.ts";
import {
  getLocalizedAtomFeedUrl,
  getLocalizedJsonFeedUrl,
  getLocalizedRssFeedUrl,
} from "../../utils/feed-paths.ts";
import { THEME_BOOTSTRAP_SCRIPT } from "../../utils/theme-bootstrap.ts";

const CANONICAL_BRAND_ICON_NAMES = ["github", "rss"] as const;

// Lume JSX renders a fragment here; the document doctype still has to be
// injected explicitly ahead of `<html>`.
const DOCTYPE = { __html: "<!doctype html>\n" } as const;
// Keep the theme bootstrap inline to avoid an extra render-blocking fetch on
// first paint while still setting the resolved color mode before CSS applies.
const THEME_BOOTSTRAP = {
  __html: THEME_BOOTSTRAP_SCRIPT,
} as const;

type BuildData = {
  swDebugLevel?: "off" | "summary" | "verbose";
};

type AlternateData = {
  readonly lang?: unknown;
  readonly url?: unknown;
};

type LayoutData = Lume.Data & {
  build?: BuildData;
  lang?: string;
  searchIndexed?: boolean;
  unlisted?: boolean;
  alternates?: ReadonlyArray<AlternateData>;
  siteChrome?: SiteChromeData;
  // Populated by `src/_data.ts` in real builds. These stay optional so layout
  // tests can render with partial data.
  siteName?: string;
  author?: string;
  metas?: { readonly site?: string; readonly description?: string };
  blogStartYear?: number;
};

type SsxElement = ReturnType<typeof jsx>;
type LayoutRenderable =
  | SsxElement
  | string
  | number
  | boolean
  | null
  | undefined;
type AwaitableLayoutRenderable = LayoutRenderable | Promise<LayoutRenderable>;
type LayoutComponent<TProps> = (props: TProps) => AwaitableLayoutRenderable;
type HeaderProps = Readonly<{
  currentUrl: string;
  language: SiteLanguage;
  languageAlternates?: Partial<Record<SiteLanguage, string>>;
  icon?: IconResolver;
}>;
type FooterProps = Readonly<{
  author: string;
  language: SiteLanguage;
  homeUrl: string;
  syndicationPageUrl: string;
  blogStartYear: number;
}>;
type ComponentKey = "Header" | "Footer";

type Comp = {
  Header: LayoutComponent<HeaderProps>;
  Footer: LayoutComponent<FooterProps>;
};

function collectAlternateUrls(
  alternates: ReadonlyArray<AlternateData> | undefined,
  currentLanguage: SiteLanguage,
  currentUrl: string,
): Partial<Record<SiteLanguage, string>> {
  const urls: Partial<Record<SiteLanguage, string>> = {};

  for (const alternate of alternates ?? []) {
    const language = tryResolveSiteLanguage(alternate.lang);

    if (language === undefined) {
      continue;
    }
    const alternateUrl = typeof alternate.url === "string" ? alternate.url : "";

    if (alternateUrl.length > 0) {
      urls[language] = alternateUrl;
    }
  }

  if (urls[currentLanguage] === undefined) {
    urls[currentLanguage] = currentUrl;
  }

  return urls;
}

function isPostDetailUrl(currentUrl: string): boolean {
  return /\/posts\/[^/]+\/$/.test(currentUrl);
}

function isPostsArchiveUrl(currentUrl: string): boolean {
  return /\/posts\/$/.test(currentUrl);
}

function resolveComponent<TProps>(
  value: unknown,
  key: ComponentKey,
): LayoutComponent<TProps> {
  if (typeof value === "object" && value !== null) {
    const component = Reflect.get(value, key);

    if (typeof component === "function") {
      return (props) =>
        Reflect.apply(component, value, [props]) as AwaitableLayoutRenderable;
    }
  }

  return () => "";
}

function resolveSiteChromeData(siteChrome?: SiteChromeData): SiteChromeData {
  return {
    faviconIcoUrl: "/favicon.ico",
    faviconSvgUrl: "/favicon.svg",
    appleTouchIconUrl: "/apple-touch-icon.png",
    themeColorLight: "#ffffff",
    themeColorDark: "#262626",
    ...siteChrome,
  };
}

function resolveIconResolver(
  helpers: Lume.Helpers,
): IconResolver | undefined {
  return typeof helpers.icon === "function"
    ? helpers.icon.bind(helpers)
    : undefined;
}

export default (
  {
    title,
    description,
    url,
    children,
    comp,
    build,
    lang,
    searchIndexed,
    unlisted,
    alternates,
    siteChrome,
    siteName,
    author,
    metas,
    blogStartYear,
  }: LayoutData,
  _helpers: Lume.Helpers,
) => {
  // The real site injects these via `src/_data.ts`; fallbacks keep tests and
  // isolated renders from depending on the full Lume data pipeline.
  const resolvedSiteName = siteName ?? "normco.re";
  const resolvedAuthor = author ?? "Phiphi";
  const resolvedSiteChrome = resolveSiteChromeData(siteChrome);
  const pageTitle = title && title !== resolvedSiteName
    ? `${title} - ${resolvedSiteName}`
    : resolvedSiteName;
  const { language, translations, homeUrl, syndicationPageUrl } =
    resolvePageSetup(lang);
  const metaDescription = description ?? metas?.description ??
    "Personal blog by Phiphi, based in Chengdu, China.";
  const documentLanguage = getLanguageTag(language);
  const currentUrl = typeof url === "string" && url ? url : "/";
  const isIndexable = unlisted !== true;
  const canonicalUrl = isIndexable
    ? new URL(currentUrl, `https://${resolvedSiteName}`).href
    : undefined;
  const includeLinkPrefetch = !isPostDetailUrl(currentUrl) &&
    !isPostsArchiveUrl(currentUrl);
  const swDebugLevel = build?.swDebugLevel ?? "off";
  // Pagefind should index only public pages that opt in. Unlisted or
  // search-disabled routes still render normally but stay out of the generated
  // search corpus.
  const includePagefindBody = isIndexable && searchIndexed !== false;
  const atomXmlUrl = getLocalizedAtomFeedUrl(language);
  const feedXmlUrl = getLocalizedRssFeedUrl(language);
  const feedJsonUrl = getLocalizedJsonFeedUrl(language);
  const alternateUrls = collectAlternateUrls(alternates, language, currentUrl);
  const Header = resolveComponent<HeaderProps>(comp, "Header");
  const Footer = resolveComponent<FooterProps>(comp, "Footer");
  const iconResolver = resolveIconResolver(_helpers);

  // Resolve shared Simple Icons during render so missing plugin wiring fails
  // eagerly instead of only on the pages that happen to use these logos.
  for (const iconName of CANONICAL_BRAND_ICON_NAMES) {
    iconResolver?.(iconName, "simpleicons");
  }

  return (
    <>
      {DOCTYPE}
      <html
        lang={documentLanguage}
        data-color-mode="light"
        data-light-theme="light"
        data-dark-theme="dark"
      >
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>{pageTitle}</title>
          <meta name="description" content={metaDescription} />
          {!isIndexable && <meta name="robots" content="noindex" />}
          {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
          <meta name="color-scheme" content="light dark" />
          <meta
            name="theme-color"
            content={resolvedSiteChrome.themeColorLight}
            media="(prefers-color-scheme: light)"
          />
          <meta
            name="theme-color"
            content={resolvedSiteChrome.themeColorDark}
            media="(prefers-color-scheme: dark)"
          />
          <link
            rel="manifest"
            href={APP_MANIFEST_PATH}
            type={APP_MANIFEST_MIME_TYPE}
          />
          <link
            rel="icon"
            href={resolvedSiteChrome.faviconIcoUrl}
            sizes="48x48"
          />
          <link
            rel="icon"
            href={resolvedSiteChrome.faviconSvgUrl}
            type="image/svg+xml"
            sizes="any"
          />
          <link
            rel="apple-touch-icon"
            href={resolvedSiteChrome.appleTouchIconUrl}
            sizes="180x180"
          />
          {
            /* Font faces are loaded from the generated stylesheet bundle.
              Explicit font preloads were removed to avoid noisy unused-preload
              warnings in Chromium. */
          }
          <link
            rel="stylesheet"
            href="/style.css"
            fetchpriority="high"
          />
          <script>{THEME_BOOTSTRAP}</script>
          <script
            src="/scripts/language-preference.js"
            data-supported-languages={SUPPORTED_LANGUAGES.join(",")}
            data-default-language={DEFAULT_LANGUAGE}
            data-current-language={language}
            data-language-alternates={JSON.stringify(alternateUrls)}
            defer
          >
          </script>
          <link
            rel="alternate"
            type="application/rss+xml"
            title={resolvedSiteName}
            href={feedXmlUrl}
          />
          <link
            rel="alternate"
            type="application/atom+xml"
            title={`${resolvedSiteName} Atom feed`}
            href={atomXmlUrl}
          />
          <link
            rel="alternate"
            type="application/feed+json"
            title={`${resolvedSiteName} JSON feed`}
            href={feedJsonUrl}
          />
        </head>
        <body data-current-language={language}>
          <a class="skip-link" href="#main-content">
            {translations.site.skipToContent}
          </a>
          <div class="site-wrapper">
            <Header
              currentUrl={currentUrl}
              language={language}
              languageAlternates={alternateUrls}
              {...(iconResolver ? { icon: iconResolver } : {})}
            />
            <main
              class="site-main"
              id="main-content"
              {...(includePagefindBody ? { "data-pagefind-body": "" } : {})}
            >
              {children}
            </main>
            <Footer
              author={resolvedAuthor}
              language={language}
              homeUrl={homeUrl}
              syndicationPageUrl={syndicationPageUrl}
              blogStartYear={blogStartYear ?? new Date().getFullYear()}
            />
          </div>
          <script
            src="/scripts/header-client.js"
            fetchpriority="low"
            defer
          >
          </script>
          <script
            src="/scripts/about-contact-toggletips.js"
            fetchpriority="low"
            defer
          >
          </script>
          {includeLinkPrefetch && (
            <script
              src="/scripts/link-prefetch-intent.js"
              fetchpriority="low"
              defer
            >
            </script>
          )}
          <script
            src="/scripts/sw-register.js"
            data-sw-url="/sw.js"
            data-sw-debug-level={swDebugLevel}
            fetchpriority="low"
            defer
          >
          </script>
        </body>
      </html>
    </>
  );
};
