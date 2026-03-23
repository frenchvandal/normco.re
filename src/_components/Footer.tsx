import type { jsx } from "lume/jsx-runtime";

import { getSiteTranslations, type SiteLanguage } from "../utils/i18n.ts";
import { formatCopyrightYears } from "../utils/copyright.ts";

const repositoryUrl = "https://github.com/frenchvandal/normco.re" as const;
type SsxElement = ReturnType<typeof jsx>;
type FooterBrandIcon = "github" | "rss";
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
  icon: FooterBrandIcon;
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
      <span
        class={`site-footer-icon site-footer-icon--brand site-footer-icon--${icon}`}
        aria-hidden="true"
      >
      </span>
      <span class="site-footer-link-label">{label}</span>
    </a>
  );
}

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
            icon: "github",
            external: true,
          })}
          {renderFooterLink({
            href: syndicationPageUrl,
            label: translations.feeds.title,
            ariaLabel: translations.site.syndicationPageLinkAriaLabel,
            icon: "rss",
          })}
        </nav>
      </div>
    </footer>
  );
};
