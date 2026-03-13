/** Site footer with copyright and primary links. */

import { getSiteTranslations, type SiteLanguage } from "../utils/i18n.ts";

const repositoryUrl = "https://github.com/frenchvandal/normco.re" as const;

/** Renders the site footer with the repository and RSS links. */
export default (
  {
    author,
    language,
    feedXmlUrl,
  }: {
    readonly author: string;
    readonly language: SiteLanguage;
    readonly feedXmlUrl: string;
  },
) => {
  const year = new Date().getFullYear();
  const translations = getSiteTranslations(language);

  return (
    <footer class="site-footer">
      <div class="site-footer-inner">
        <span>
          © {year} {author}
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
            GitHub
          </a>
          <a href={feedXmlUrl} aria-label={translations.site.rssLinkAriaLabel}>
            RSS
          </a>
        </nav>
      </div>
    </footer>
  );
};
