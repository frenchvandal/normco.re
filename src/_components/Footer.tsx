/** Site footer with copyright and primary links. */

import type { jsx } from "lume/jsx-runtime";

import { getSiteTranslations, type SiteLanguage } from "../utils/i18n.ts";
import { formatCopyrightYears } from "../utils/copyright.ts";
import { GITHUB_ICON, RSS_ICON } from "../utils/carbon-icons.ts";
import CarbonIcon from "./CarbonIcon.tsx";

const repositoryUrl = "https://github.com/frenchvandal/normco.re" as const;
type SsxElement = ReturnType<typeof jsx>;
type FooterProps = Readonly<{
  author: string;
  language: SiteLanguage;
  homeUrl: string;
  syndicationPageUrl: string;
  blogStartYear: number;
  currentYear?: number;
}>;
type FooterLinkProps = Readonly<{
  href: string;
  label: string;
  ariaLabel: string;
  icon: typeof GITHUB_ICON | typeof RSS_ICON;
  external?: boolean;
}>;

function renderFooterLink(
  { href, label, ariaLabel, icon, external = false }: FooterLinkProps,
): SsxElement {
  return (
    <a
      href={href}
      class="site-footer-link"
      aria-label={ariaLabel}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      <CarbonIcon
        icon={icon}
        className="site-footer-icon"
        width={16}
        height={16}
      />
      <span class="site-footer-link-label">{label}</span>
    </a>
  );
}

/** Renders the site footer with the repository and RSS links. */
export default (
  {
    author,
    language,
    homeUrl,
    syndicationPageUrl,
    blogStartYear,
    currentYear = new Date().getFullYear(),
  }: FooterProps,
): SsxElement => {
  const copyrightYears = formatCopyrightYears(blogStartYear, currentYear);
  const translations = getSiteTranslations(language);

  return (
    <footer class="site-footer">
      <div class="site-footer-inner">
        <div class="site-footer-brand">
          <a href={homeUrl} class="site-footer-mark">
            normco.re
          </a>
          <p class="site-footer-copy">
            © {copyrightYears} {author}
          </p>
        </div>
        <nav
          class="site-footer-nav"
          aria-label={translations.site.siteLinksAriaLabel}
        >
          {renderFooterLink({
            href: repositoryUrl,
            label: "GitHub",
            ariaLabel: translations.site.repositoryLinkAriaLabel,
            icon: GITHUB_ICON,
            external: true,
          })}
          {renderFooterLink({
            href: syndicationPageUrl,
            label: translations.feeds.title,
            ariaLabel: translations.site.syndicationPageLinkAriaLabel,
            icon: RSS_ICON,
          })}
        </nav>
      </div>
    </footer>
  );
};
