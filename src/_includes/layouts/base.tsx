/** Base HTML layout. Every page and layout chains to this. */

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
  getSiteTranslations,
  resolveSiteLanguage,
  type SiteLanguage,
  SUPPORTED_LANGUAGES,
  tryResolveSiteLanguage,
} from "../../utils/i18n.ts";
import {
  getLocalizedHFeedUrl,
  MF2_HTML_CONTENT_TYPE,
} from "../../utils/microformats.ts";

/** `<!doctype html>` prepended to the document before the `<html>` root. */
const DOCTYPE = { __html: "<!doctype html>\n" } as const;
// Keep the theme bootstrap inline to avoid an extra render-blocking fetch on
// first paint while still setting the resolved color mode before CSS applies.
const THEME_BOOTSTRAP = {
  __html:
    '(()=>{const r=document.documentElement,m=matchMedia("(prefers-color-scheme: dark)");let v=null;try{const s=localStorage.getItem("color-mode");if(s==="light"||s==="dark"||s==="system")v=s;else{const l=localStorage.getItem("color-scheme");v=l==="light"||l==="dark"?l:null}}catch{v=null}const p=v??"system",t=p==="light"||p==="dark"?p:m.matches?"dark":"light";r.setAttribute("data-light-theme","light");r.setAttribute("data-dark-theme","dark");r.setAttribute("data-color-mode",t);r.setAttribute("data-theme-preference",p);r.setAttribute("data-color-scheme",t);document.addEventListener("DOMContentLoaded",()=>{const e=document.getElementById("theme-toggle");if(e){const l=e.getAttribute("data-label-switch-light")??"Switch to light theme",d=e.getAttribute("data-label-switch-dark")??"Switch to dark theme",s=e.getAttribute("data-label-follow-system")??"Follow system theme",n=p==="light"?d:p==="dark"?s:l;e.setAttribute("aria-label",n);e.setAttribute("title",n)}})})()',
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
  unlisted?: boolean;
  alternates?: ReadonlyArray<AlternateData>;
  siteChrome?: SiteChromeData;
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
type LayoutRenderable =
  | SsxElement
  | string
  | number
  | boolean
  | null
  | undefined;
type AwaitableLayoutRenderable = LayoutRenderable | Promise<LayoutRenderable>;

/** Minimal typed interface for the components used in this layout. */
type Comp = {
  Header: (props: {
    readonly currentUrl: string;
    readonly language: SiteLanguage;
    readonly languageAlternates?: Partial<Record<SiteLanguage, string>>;
  }) => AwaitableLayoutRenderable;
  Footer: (props: {
    readonly author: string;
    readonly language: SiteLanguage;
    readonly feedXmlUrl: string;
    readonly blogStartYear: number;
  }) => AwaitableLayoutRenderable;
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

function resolveHeaderComponent(value: unknown): Comp["Header"] {
  if (typeof value === "object" && value !== null) {
    const Header = Reflect.get(value, "Header");

    if (typeof Header === "function") {
      return (props) =>
        Reflect.apply(Header, value, [props]) as AwaitableLayoutRenderable;
    }
  }

  return () => "";
}

function resolveFooterComponent(value: unknown): Comp["Footer"] {
  if (typeof value === "object" && value !== null) {
    const Footer = Reflect.get(value, "Footer");

    if (typeof Footer === "function") {
      return (props) =>
        Reflect.apply(Footer, value, [props]) as AwaitableLayoutRenderable;
    }
  }

  return () => "";
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
    siteChrome,
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
  const resolvedSiteChrome: SiteChromeData = {
    faviconIcoUrl: siteChrome?.faviconIcoUrl ?? "/favicon.ico",
    faviconSvgUrl: siteChrome?.faviconSvgUrl ?? "/favicon.svg",
    appleTouchIconUrl: siteChrome?.appleTouchIconUrl ?? "/apple-touch-icon.png",
    appleTouchIconLinks: siteChrome?.appleTouchIconLinks ?? [
      {
        href: siteChrome?.appleTouchIconUrl ?? "/apple-touch-icon.png",
        sizes: "180x180",
      },
    ],
    themeColorLight: siteChrome?.themeColorLight ?? "#ffffff",
    themeColorDark: siteChrome?.themeColorDark ?? "#262626",
  };
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
  const atomXmlUrl = getLocalizedUrl("/atom.xml", language);
  const feedXmlUrl = getLocalizedUrl("/feed.xml", language);
  const feedJsonUrl = getLocalizedUrl("/feed.json", language);
  const hFeedUrl = getLocalizedHFeedUrl(language);
  const alternateUrls = collectAlternateUrls(alternates, language, currentUrl);
  const Header = resolveHeaderComponent(comp);
  const Footer = resolveFooterComponent(comp);

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
          <meta name="application-name" content={resolvedSiteName} />
          <meta name="apple-mobile-web-app-title" content={resolvedSiteName} />
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
          {resolvedSiteChrome.appleTouchIconLinks?.map((icon) => (
            <link
              rel="apple-touch-icon"
              href={icon.href}
              sizes={icon.sizes}
            />
          ))}
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
          <link
            rel="alternate"
            type={MF2_HTML_CONTENT_TYPE}
            title={`${resolvedSiteName} h-feed`}
            href={hFeedUrl}
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
            src="/scripts/header-tooltips.js"
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
