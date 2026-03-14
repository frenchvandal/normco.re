/** Base HTML layout. Every page and layout chains to this. */

import type { jsx } from "lume/jsx-runtime";

import {
  DEFAULT_LANGUAGE,
  getLanguageTag,
  getLocalizedUrl,
  getSiteTranslations,
  resolveSiteLanguage,
  type SiteLanguage,
  SUPPORTED_LANGUAGES,
  tryResolveSiteLanguage,
} from "../../utils/i18n.ts";

/** `<!doctype html>` prepended to the document before the `<html>` root. */
const DOCTYPE = { __html: "<!doctype html>\n" } as const;

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
  unlisted?: boolean;
  alternates?: ReadonlyArray<AlternateData>;
  /** Injected by `src/_data.ts` - canonical site name / domain. */
  siteName?: string;
  /** Injected by `src/_data.ts` - primary author name. */
  author?: string;
  /** Injected by `src/_data.ts` - site metadata for meta tags. */
  metas?: { readonly site?: string; readonly description?: string };
  /** Injected by `src/_data.ts` - year the blog was launched. */
  blogStartYear?: number;
};

/** Return type of an ssx JSX element, used to type Lume component functions. */
type SsxElement = ReturnType<typeof jsx>;

/** Minimal typed interface for the components used in this layout. */
type Comp = {
  Header: (props: {
    readonly currentUrl: string;
    readonly language: SiteLanguage;
  }) => SsxElement;
  Footer: (props: {
    readonly author: string;
    readonly language: SiteLanguage;
    readonly feedXmlUrl: string;
    readonly blogStartYear: number;
  }) => SsxElement;
};

/** Returns alternate URLs keyed by language for the current page. */
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

/** Returns true when the current URL is an individual post route. */
function isPostDetailUrl(currentUrl: string): boolean {
  return /\/posts\/[^/]+\/$/.test(currentUrl);
}

/** Returns true when the current URL is a posts archive route (localized or default). */
function isPostsArchiveUrl(currentUrl: string): boolean {
  return /\/posts\/$/.test(currentUrl);
}

/** Renders the full HTML document shell. */
export default (
  {
    title,
    description,
    url,
    children,
    comp,
    build,
    lang,
    unlisted,
    alternates,
    siteName,
    author,
    metas,
    blogStartYear,
  }: LayoutData,
  _helpers: Lume.Helpers,
) => {
  // siteName and author are always provided by src/_data.ts; the fallbacks are
  // a safety net for test environments that omit them.
  const resolvedSiteName = siteName ?? "normco.re";
  const resolvedAuthor = author ?? "Phiphi";
  const pageTitle = title ? `${title} - ${resolvedSiteName}` : resolvedSiteName;
  const language = resolveSiteLanguage(lang);
  const translations = getSiteTranslations(language);
  const metaDescription = description ?? metas?.description ??
    "Personal blog by Phiphi, based in Chengdu, China.";
  const documentLanguage = getLanguageTag(language);
  const currentUrl = typeof url === "string" && url.length > 0 ? url : "/";
  const includeLinkPrefetch = !isPostDetailUrl(currentUrl) &&
    !isPostsArchiveUrl(currentUrl);
  const swDebugLevel = build?.swDebugLevel ?? "off";
  const includePagefindBody = unlisted !== true;
  const feedXmlUrl = getLocalizedUrl("/feed.xml", language);
  const feedJsonUrl = getLocalizedUrl("/feed.json", language);
  const alternateUrls = collectAlternateUrls(alternates, language, currentUrl);

  // Lume.comp is loosely typed; cast to the minimal Comp interface (§5.4 - library boundary).
  const { Header, Footer } = comp as unknown as Comp;

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
          <meta name="color-scheme" content="light dark" />
          <link
            rel="preload"
            href="/fonts/ibm-plexsans-100-normal-400-latin.woff2"
            as="font"
            type="font/woff2"
            crossorigin="anonymous"
          />
          <link
            rel="preload"
            href="/fonts/ibm-plexsans-100-normal-600-latin.woff2"
            as="font"
            type="font/woff2"
            crossorigin="anonymous"
          />
          <link
            rel="stylesheet"
            href="/style.css"
            fetchpriority="high"
          />
          <script src="/scripts/anti-flash.js"></script>
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
            type="application/json"
            title={`${resolvedSiteName} JSON feed`}
            href={feedJsonUrl}
          />
        </head>
        <body data-a11y-link-underlines="true" data-current-language={language}>
          <a class="skip-link" href="#main-content">
            {translations.site.skipToContent}
          </a>
          <div class="site-wrapper">
            <Header
              currentUrl={currentUrl}
              language={language}
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
              feedXmlUrl={feedXmlUrl}
              blogStartYear={blogStartYear ?? new Date().getFullYear()}
            />
          </div>
          <script
            src="/scripts/disclosure-controls.js"
            fetchpriority="low"
            defer
          >
          </script>
          <script
            src="/scripts/theme-toggle.js"
            fetchpriority="low"
            defer
          >
          </script>
          <script
            src="/scripts/pagefind-lazy-init.js"
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
            data-sw-module-url="/sw.js"
            data-sw-classic-url="/sw-classic.js"
            data-sw-url="/sw-classic.js"
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
