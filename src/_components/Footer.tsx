import type { jsx } from "lume/jsx-runtime";

import { getSiteTranslations, type SiteLanguage } from "../utils/i18n.ts";
import { formatCopyrightYears } from "../utils/copyright.ts";
import { getSiteName } from "../utils/site-identity.ts";
import SiteIcon from "./SiteIcon.tsx";

const repositoryUrl = "https://github.com/frenchvandal/normco.re" as const;
type El = ReturnType<typeof jsx>;
type FooterProps = Readonly<{
  author: string;
  language: SiteLanguage;
  homeUrl: string;
  syndicationPageUrl: string;
  blogStartYear: number;
  currentYear?: number;
}>;

function renderFooterLink(
  { href, label, ariaLabel, icon, external = false }: Readonly<{
    href: string;
    label: string;
    ariaLabel: string;
    icon: "github" | "rss";
    external?: boolean;
  }>,
): El {
  const iconMarkup = icon === "github"
    ? (
      <SiteIcon
        name="github"
        className="site-footer-icon"
        width={16}
        height={16}
      />
    )
    : (
      <span
        class={`site-footer-icon site-footer-icon--brand site-footer-icon--${icon}`}
        aria-hidden="true"
      >
      </span>
    );

  return (
    <a
      href={href}
      class="site-footer-link"
      aria-label={ariaLabel}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {iconMarkup}
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
): El => {
  const copyrightYears = formatCopyrightYears(blogStartYear, currentYear);
  const translations = getSiteTranslations(language);
  const siteName = getSiteName(language);

  return (
    <footer class="site-footer">
      <div class="site-footer-inner">
        <div class="site-footer-brand">
          <a href={homeUrl} class="site-footer-mark">
            {siteName}
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
