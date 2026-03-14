/** Site footer with copyright and primary links. */

import { getSiteTranslations, type SiteLanguage } from "../utils/i18n.ts";
import { formatCopyrightYears } from "../utils/copyright.ts";
import { GITHUB_ICON_PATH, RSS_ICON_PATHS } from "../utils/carbon-icons.ts";

const repositoryUrl = "https://github.com/frenchvandal/normco.re" as const;

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
              <path d={GITHUB_ICON_PATH}></path>
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
              {RSS_ICON_PATHS.map((path) => <path key={path} d={path}></path>)}
            </svg>
          </a>
        </nav>
      </div>
    </footer>
  );
};
