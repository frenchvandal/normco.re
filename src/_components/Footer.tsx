/** Site footer with copyright and primary links. */

import { getSiteTranslations, type SiteLanguage } from "../utils/i18n.ts";
import { formatCopyrightYears } from "../utils/copyright.ts";

const repositoryUrl = "https://github.com/frenchvandal/normco.re" as const;

/**
 * Carbon GitHub icon — official Carbon Design System icon.
 * Source: https://carbondesignsystem.com/elements/icons/library/
 * Icon name: logo--github
 */
const CARBON_GITHUB_ICON_PATH =
  "M16 2a14 14 0 0 0-4.43 27.28c.7.13 1-.3 1-.67s0-1.21 0-2.38c-3.89.84-4.71-1.88-4.71-1.88A3.71 3.71 0 0 0 6.24 22.3c-1.27-.86.1-.85.1-.85A2.94 2.94 0 0 1 8.48 22.9a3 3 0 0 0 4.08 1.16 2.93 2.93 0 0 1 .88-1.87c-3.1-.36-6.37-1.56-6.37-6.92a5.4 5.4 0 0 1 1.44-3.76 5 5 0 0 1 .14-3.7s1.17-.38 3.85 1.43a13.3 13.3 0 0 1 7 0c2.67-1.81 3.84-1.43 3.84-1.43a5 5 0 0 1 .14 3.7 5.4 5.4 0 0 1 1.44 3.76c0 5.38-3.27 6.56-6.39 6.91a3.33 3.33 0 0 1 .95 2.59c0 1.87 0 3.38 0 3.84s.25.81 1 .67A14 14 0 0 0 16 2Z";

/**
 * Carbon RSS icon — official Carbon Design System icon.
 * Source: https://carbondesignsystem.com/elements/icons/library/
 * Icon name: rss
 */
const CARBON_RSS_ICON_PATHS = [
  "M8 18c-3.3 0-6 2.7-6 6s2.7 6 6 6 6-2.7 6-6C14 20.7 11.3 18 8 18zM8 28c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4C12 26.2 10.2 28 8 28z",
  "M30 24h-2C28 13 19 4 8 4V2C20.1 2 30 11.9 30 24z",
  "M22 24h-2c0-6.6-5.4-12-12-12v-2C15.7 10 22 16.3 22 24z",
] as const;

/** Renders the site footer with the repository and RSS links. */
export default (
  {
    author,
    language,
    feedXmlUrl,
    blogStartYear,
  }: {
    readonly author: string;
    readonly language: SiteLanguage;
    readonly feedXmlUrl: string;
    readonly blogStartYear: number;
  },
) => {
  const year = new Date().getFullYear();
  const copyrightYears = formatCopyrightYears(blogStartYear, year);
  const translations = getSiteTranslations(language);

  return (
    <footer class="site-footer">
      <div class="site-footer-inner">
        <span>
          © {copyrightYears} {author}
        </span>
        <nav
          class="site-footer-nav"
          aria-label={translations.site.siteLinksAriaLabel}
        >
          <a
            href={repositoryUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={translations.site.repositoryLinkAriaLabel}
          >
            <svg
              class="site-footer-icon"
              width="16"
              height="16"
              viewBox="0 0 32 32"
              fill="currentColor"
              aria-hidden="true"
              focusable="false"
            >
              <path d={CARBON_GITHUB_ICON_PATH}></path>
            </svg>
          </a>
          <a href={feedXmlUrl} aria-label={translations.site.rssLinkAriaLabel}>
            <svg
              class="site-footer-icon"
              width="16"
              height="16"
              viewBox="0 0 32 32"
              fill="currentColor"
              aria-hidden="true"
              focusable="false"
            >
              {CARBON_RSS_ICON_PATHS.map((path) => (
                <path key={path} d={path}></path>
              ))}
            </svg>
          </a>
        </nav>
      </div>
    </footer>
  );
};
