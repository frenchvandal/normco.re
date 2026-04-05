/** @jsxImportSource lume */
import type { jsx } from "lume/jsx-runtime";
import LANGUAGE_PREFERENCE_SCRIPT from "../../scripts/language-preference.js" with {
  type: "text",
};

import {
  APP_MANIFEST_MIME_TYPE,
  APP_MANIFEST_PATH,
  type SiteChromeData,
} from "../../utils/site-manifest.ts";
import {
  ATOM_FEED_MIME_TYPE,
  JSON_FEED_MIME_TYPE,
  RSS_FEED_MIME_TYPE,
  SVG_MIME_TYPE,
} from "../../utils/media-types.ts";
import {
  DEFAULT_LANGUAGE,
  getLanguageTag,
  type SiteLanguage,
  SUPPORTED_LANGUAGES,
  tryResolveSiteLanguage,
} from "../../utils/i18n.ts";
import { resolvePageSetup } from "../../utils/page-setup.ts";
import {
  getLocalizedAtomFeedUrl,
  getLocalizedJsonFeedUrl,
  getLocalizedRssFeedUrl,
} from "../../utils/feed-paths.ts";
import {
  getDefaultSiteDescription,
  SITE_AUTHOR,
  SITE_NAME,
  SITE_ORIGIN,
  SITE_SHORT_NAME,
} from "../../utils/site-identity.ts";
import { THEME_BOOTSTRAP_SCRIPT } from "../../utils/theme-bootstrap.ts";

// Lume JSX renders a fragment here; the document doctype still has to be
// injected explicitly ahead of `<html>`.
const DOCTYPE = { __html: "<!doctype html>\n" } as const;
// Keep the theme bootstrap inline to avoid an extra render-blocking fetch on
// first paint while still setting the resolved color mode before CSS applies.
const THEME_BOOTSTRAP = {
  __html: THEME_BOOTSTRAP_SCRIPT,
} as const;
const LANGUAGE_PREFERENCE_BOOTSTRAP = {
  __html: LANGUAGE_PREFERENCE_SCRIPT,
} as const;

type BuildData = {
  swDebugLevel?: "off" | "summary" | "verbose";
};

type LumeData = Record<string, unknown>;
type LumeHelpers = Record<string, unknown>;

type AlternateData = {
  readonly lang?: unknown;
  readonly url?: unknown;
};

type LayoutData = LumeData & {
  build?: BuildData;
  title?: string;
  description?: string;
  lang?: string;
  url?: string;
  children?: LayoutRenderable;
  comp?: unknown;
  searchIndexed?: boolean;
  unlisted?: boolean;
  extraStylesheets?: ReadonlyArray<string>;
  afterMainContent?: LayoutRenderable;
  renderAfterMainContent?: (
    data: LayoutData,
    helpers: LumeHelpers,
  ) => AwaitableLayoutRenderable;
  alternates?: ReadonlyArray<AlternateData>;
  siteChrome?: SiteChromeData;
  // Populated by `src/_data.ts` in real builds. These stay optional so layout
  // tests can render with partial data.
  siteName?: string;
  siteOrigin?: string;
  author?: string;
  metas?: { readonly site?: string; readonly description?: string };
  blogStartYear?: number;
};

type SsxElement = ReturnType<typeof jsx>;
type LayoutRenderable = SsxElement | unknown;
type AwaitableLayoutRenderable = LayoutRenderable | Promise<LayoutRenderable>;
type LayoutComponent<TProps> = (props: TProps) => AwaitableLayoutRenderable;
type HeaderProps = Readonly<{
  currentUrl: string;
  language: SiteLanguage;
  languageAlternates?: Partial<Record<SiteLanguage, string>>;
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

    if (alternateUrl) {
      urls[language] = alternateUrl;
    }
  }

  urls[currentLanguage] ??= currentUrl;

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
  if (typeof value !== "object" || value === null) {
    return () => "";
  }

  const component = (value as Partial<Record<ComponentKey, unknown>>)[key];

  if (typeof component === "function") {
    return component as LayoutComponent<TProps>;
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

function createDeferredEnhancementBootstrap(
  includeLinkPrefetch: boolean,
  swDebugLevel: NonNullable<BuildData["swDebugLevel"]>,
): { __html: string } {
  const backgroundStatements = [
    includeLinkPrefetch
      ? 'loadScript("/scripts/link-prefetch-intent.js", { fetchPriority: "low" });'
      : "",
    `loadScript("/scripts/sw-register.js", {
      dataset: {
        swUrl: "/sw.js",
        swDebugLevel: ${JSON.stringify(swDebugLevel)},
      },
      fetchPriority: "low",
    });`,
  ].filter(Boolean).join("\n");

  return {
    __html:
      `(()=>{const doc=document;function loadScript(src,{dataset,fetchPriority}={}){const script=doc.createElement("script");script.src=src;if(fetchPriority){script.setAttribute("fetchpriority",fetchPriority);}if(dataset){for(const[key,value]of Object.entries(dataset)){script.dataset[key]=value;}}doc.body.append(script);}function loadModule(src){const script=doc.createElement("script");script.type="module";script.src=src;doc.body.append(script);}const loadInteractive=()=>loadModule("/scripts/header-client.js");const loadBackground=()=>{${backgroundStatements}};if("requestAnimationFrame"in window){window.requestAnimationFrame(loadInteractive);}else{window.setTimeout(loadInteractive,0);}if("requestIdleCallback"in window){window.requestIdleCallback(loadBackground,{timeout:2000});}else{window.setTimeout(loadBackground,1);}})();`,
  };
}

export default async (
  data: LayoutData,
  _helpers: LumeHelpers,
) => {
  const {
    title,
    description,
    url,
    children,
    comp,
    build,
    lang,
    searchIndexed,
    unlisted,
    extraStylesheets,
    afterMainContent,
    renderAfterMainContent,
    alternates,
    siteChrome,
    siteName,
    siteOrigin,
    author,
    metas,
    blogStartYear,
  } = data;
  // The real site injects these via `src/_data.ts`; fallbacks keep tests and
  // isolated renders from depending on the full Lume data pipeline.
  const resolvedSiteName = metas?.site ?? siteName ?? SITE_NAME;
  const resolvedSiteOrigin = siteOrigin ?? SITE_ORIGIN;
  const resolvedAuthor = author ?? SITE_AUTHOR;
  const resolvedSiteChrome = resolveSiteChromeData(siteChrome);
  const pageTitle = title && title !== resolvedSiteName &&
      title !== SITE_SHORT_NAME
    ? `${title} - ${SITE_SHORT_NAME}`
    : resolvedSiteName;
  const { language, translations, homeUrl, syndicationPageUrl } =
    resolvePageSetup(lang);
  const metaDescription = description ?? metas?.description ??
    getDefaultSiteDescription(resolvedAuthor);
  const documentLanguage = getLanguageTag(language);
  const currentUrl = typeof url === "string" && url ? url : "/";
  const isIndexable = unlisted !== true;
  const canonicalUrl = isIndexable
    ? new URL(currentUrl, resolvedSiteOrigin).href
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
  const deferredEnhancementBootstrap = createDeferredEnhancementBootstrap(
    includeLinkPrefetch,
    swDebugLevel,
  );
  const resolvedAfterMainContent = typeof renderAfterMainContent === "function"
    ? await renderAfterMainContent(data, _helpers)
    : afterMainContent;
  const alternateUrls = collectAlternateUrls(alternates, language, currentUrl);
  const Header = resolveComponent<HeaderProps>(comp, "Header");
  const Footer = resolveComponent<FooterProps>(comp, "Footer");

  return (
    <>
      {DOCTYPE}
      <html lang={documentLanguage} data-color-mode="light">
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
            type={SVG_MIME_TYPE}
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
          {extraStylesheets?.map((href: string) => (
            <link
              key={href}
              rel="stylesheet"
              href={href}
            />
          ))}
          <script>{THEME_BOOTSTRAP}</script>
          <script
            data-supported-languages={SUPPORTED_LANGUAGES.join(",")}
            data-default-language={DEFAULT_LANGUAGE}
            data-current-language={language}
            data-language-alternates={JSON.stringify(alternateUrls)}
          >
            {LANGUAGE_PREFERENCE_BOOTSTRAP}
          </script>
          <link
            rel="alternate"
            type={RSS_FEED_MIME_TYPE}
            title={resolvedSiteName}
            href={feedXmlUrl}
          />
          <link
            rel="alternate"
            type={ATOM_FEED_MIME_TYPE}
            title={`${resolvedSiteName} Atom feed`}
            href={atomXmlUrl}
          />
          <link
            rel="alternate"
            type={JSON_FEED_MIME_TYPE}
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
            />
            <main
              class="site-main"
              id="main-content"
              {...(includePagefindBody ? { "data-pagefind-body": "" } : {})}
            >
              {children}
            </main>
            {resolvedAfterMainContent}
            <Footer
              author={resolvedAuthor}
              language={language}
              homeUrl={homeUrl}
              syndicationPageUrl={syndicationPageUrl}
              blogStartYear={blogStartYear ?? new Date().getFullYear()}
            />
          </div>
          <script>{deferredEnhancementBootstrap}</script>
        </body>
      </html>
    </>
  );
};
