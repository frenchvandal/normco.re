/** Site footer with copyright and primary links. */

import { getSiteTranslations, type SiteLanguage } from "../utils/i18n.ts";
import { formatCopyrightYears } from "../utils/copyright.ts";
import { GITHUB_ICON, RSS_ICON } from "../utils/carbon-icons.ts";
import CarbonIcon from "./CarbonIcon.tsx";

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
            <CarbonIcon
              icon={GITHUB_ICON}
              className="site-footer-icon"
              width={16}
              height={16}
            />
          </a>
          <a href={feedXmlUrl} aria-label={translations.site.rssLinkAriaLabel}>
            <CarbonIcon
              icon={RSS_ICON}
              className="site-footer-icon"
              width={16}
              height={16}
            />
          </a>
        </nav>
      </div>
    </footer>
  );
};
