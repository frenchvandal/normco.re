import type { jsx } from "lume/jsx-runtime";

import {
  getLocalizedUrl,
  getPageContext,
  type SiteLanguage,
  type SiteTranslations,
} from "../utils/i18n.ts";
import { buildHeaderNavigation } from "./header-navigation.ts";
import {
  HEADER_IDS,
  HEADER_LANGUAGE_OPTIONS,
} from "../utils/header-language-menu.ts";
import { getSiteName } from "../utils/site-identity.ts";
import SiteIcon from "./SiteIcon.tsx";

type El = ReturnType<typeof jsx>;
type Translations = SiteTranslations;
type LanguageAlternates = Partial<Record<SiteLanguage, string>>;
type NavigationItem = ReturnType<typeof buildHeaderNavigation>[number];
type HeaderProps = Readonly<{
  currentUrl: string;
  language: SiteLanguage;
  languageAlternates?: LanguageAlternates;
}>;

const eh = (suffix: string) => `editorial-home-header__${suffix}`;
type HeaderVariantState = Readonly<{
  isEditorialHome: boolean;
  actionIconSize: number;
  menuIconSize: number;
}>;

function cx(...classes: ReadonlyArray<string | false | undefined>): string {
  return classes.filter((value): value is string => Boolean(value)).join(" ");
}

function editorialClass(
  variant: HeaderVariantState,
  suffix: string,
): string | undefined {
  return variant.isEditorialHome ? eh(suffix) : undefined;
}

function headerClass(
  variant: HeaderVariantState,
  baseClassName: string,
  editorialSuffix?: string,
): string {
  return cx(
    baseClassName,
    editorialSuffix ? editorialClass(variant, editorialSuffix) : undefined,
  );
}

function resolveHeaderVariant(isEditorialHome: boolean): HeaderVariantState {
  return {
    isEditorialHome,
    actionIconSize: isEditorialHome ? 16 : 20,
    menuIconSize: isEditorialHome ? 16 : 20,
  };
}

function resolveActionIconClass(variant: HeaderVariantState): string {
  return variant.isEditorialHome
    ? eh("action-icon")
    : "site-header__action-icon";
}

function resolveMenuIconClass(variant: HeaderVariantState): string {
  return variant.isEditorialHome
    ? cx("site-menu-icon", editorialClass(variant, "action-icon"))
    : "site-header__menu-icon site-menu-icon";
}

function resolvePanelHeadClass(
  variant: HeaderVariantState,
  panel: "language" | "search",
): string {
  return variant.isEditorialHome
    ? "site-header-panel-head"
    : `site-header-panel-head site-header-panel-head--${panel}`;
}

// ── Shared sub-components ──────────────────────────────────────────────

function renderHeaderAction(
  {
    buttonAttributes,
    buttonClassName = "site-header__action",
    buttonId,
    iconMarkup,
    tooltipLabel,
  }: Readonly<{
    buttonAttributes: Readonly<Record<string, string>>;
    buttonClassName?: string;
    buttonId?: string;
    iconMarkup: El;
    tooltipLabel: string;
  }>,
): El {
  return (
    <div
      class="site-popover-container site-icon-tooltip site-popover--bottom site-popover--align-center site-header-tooltip"
      data-header-tooltip=""
    >
      <button
        type="button"
        {...(buttonId ? { id: buttonId } : {})}
        class={buttonClassName}
        data-header-tooltip-trigger=""
        {...buttonAttributes}
      >
        {iconMarkup}
      </button>
      <div class="site-popover" aria-hidden="true">
        <span class="site-popover__caret" aria-hidden="true"></span>
        <div class="site-popover__content">
          <span class="site-tooltip__content">{tooltipLabel}</span>
        </div>
      </div>
    </div>
  );
}

function renderThemeIcons(className: string, size = 16): El {
  return (
    <>
      <SiteIcon
        name="sun"
        className={`theme-icon theme-icon--sun ${className}`}
        width={size}
        height={size}
      />
      <SiteIcon
        name="moon"
        className={`theme-icon theme-icon--moon ${className}`}
        width={size}
        height={size}
      />
      <SiteIcon
        name="device-desktop"
        className={`theme-icon theme-icon--system ${className}`}
        width={size}
        height={size}
      />
    </>
  );
}

function resolveHeaderActions(
  t: Translations,
  variant: HeaderVariantState,
) {
  return [
    {
      key: "search" as const,
      buttonAttributes: {
        "aria-label": t.site.searchLabel,
        "aria-expanded": "false",
        "aria-controls": HEADER_IDS.searchPanel,
      },
      buttonClassName: headerClass(variant, "site-header__action", "action"),
      iconMarkup: (
        <SiteIcon
          name="search"
          className={resolveActionIconClass(variant)}
          width={variant.actionIconSize}
          height={variant.actionIconSize}
        />
      ),
      tooltipLabel: t.site.searchLabel,
    },
    {
      key: "language" as const,
      buttonAttributes: {
        "aria-label": t.site.languageSelectAriaLabel,
        "aria-expanded": "false",
        "aria-controls": HEADER_IDS.languagePanel,
        "aria-haspopup": "menu",
      },
      buttonClassName: headerClass(
        variant,
        "site-header__action site-header__language-toggle",
        "action",
      ),
      iconMarkup: (
        <SiteIcon
          name="translation"
          className={resolveActionIconClass(variant)}
          width={variant.actionIconSize}
          height={variant.actionIconSize}
        />
      ),
      tooltipLabel: t.site.languageSelectLabel,
    },
    {
      key: "theme" as const,
      buttonAttributes: {
        "aria-label": t.site.themeToggleLabel,
        "data-label-switch-light": t.site.switchToLightThemeLabel,
        "data-label-switch-dark": t.site.switchToDarkThemeLabel,
        "data-label-follow-system": t.site.followSystemThemeLabel,
      },
      buttonClassName: headerClass(variant, "site-header__action", "action"),
      buttonId: HEADER_IDS.themeToggle,
      iconMarkup: renderThemeIcons(
        resolveActionIconClass(variant),
        variant.actionIconSize,
      ),
      tooltipLabel: t.site.themeToggleLabel,
    },
  ] as const;
}

function renderDesktopNavigationMenu(
  items: readonly NavigationItem[],
  variant: HeaderVariantState,
): El {
  return (
    <div class="site-header__menu-shell" data-site-header-menu="">
      <ul class="site-header__menu-list">
        {items.map(({ href, isCurrent, label }) => (
          <li
            key={href}
            class={`site-header__menu-list-item${
              isCurrent ? " site-header__menu-list-item--current" : ""
            }`}
          >
            <a
              href={href}
              class={headerClass(variant, "site-header__menu-item", "nav-link")}
              {...(isCurrent ? { "aria-current": "page" as const } : {})}
            >
              {variant.isEditorialHome
                ? <span class="site-header-menu-item-label">{label}</span>
                : label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function renderLanguageOptions(
  language: SiteLanguage,
  alternates: LanguageAlternates,
  optionClassName: string,
): El[] {
  return HEADER_LANGUAGE_OPTIONS.map(
    ({ label, language: optLang, tag }) => {
      const isSelected = optLang === language;
      return (
        <a
          key={optLang}
          href={alternates[optLang] ?? getLocalizedUrl("/", optLang)}
          class={optionClassName}
          data-language-option={optLang}
          hreflang={tag}
          lang={tag}
          role="menuitemradio"
          aria-checked={isSelected ? "true" : "false"}
          tabindex={isSelected ? "0" : "-1"}
        >
          <span class="site-header__language-label">{label}</span>
          <span class="site-header__language-check" aria-hidden="true">
            <SiteIcon
              name="check"
              className="site-header__language-check-icon"
              width={16}
              height={16}
            />
          </span>
        </a>
      );
    },
  );
}

function PanelHead({ className, title }: { className: string; title: string }) {
  return (
    <div class={className}>
      <p class="site-header__panel-title">{title}</p>
    </div>
  );
}

function renderLanguagePanel(
  language: SiteLanguage,
  alternates: LanguageAlternates,
  t: Translations,
  variant: HeaderVariantState,
): El {
  return (
    <div
      id={HEADER_IDS.languagePanel}
      class={headerClass(
        variant,
        "site-header__panel site-header__language-panel",
        "panel",
      )}
      data-language-panel=""
      hidden
    >
      <div
        class={headerClass(variant, "site-header__panel-content", "panel-box")}
      >
        <PanelHead
          className={resolvePanelHeadClass(variant, "language")}
          title={t.site.languageSelectLabel}
        />
        <div
          class={headerClass(
            variant,
            "site-header__language-menu",
            "language-menu",
          )}
          role="menu"
          aria-label={t.site.languageSelectLabel}
          data-language-menu=""
        >
          {renderLanguageOptions(
            language,
            alternates,
            headerClass(variant, "site-header__language-option", "menu-option"),
          )}
        </div>
      </div>
    </div>
  );
}

function renderSearchPanel(
  t: Translations,
  variant: HeaderVariantState,
): El {
  return (
    <div
      id={HEADER_IDS.searchPanel}
      class={headerClass(
        variant,
        "site-header__panel site-header__search-panel",
        "panel",
      )}
      role="search"
      aria-label={t.site.searchLabel}
      hidden
      data-search-panel=""
    >
      <div
        class={headerClass(variant, "site-header__panel-content", "panel-box")}
      >
        {variant.isEditorialHome && (
          <PanelHead
            className={resolvePanelHeadClass(variant, "search")}
            title={t.site.searchLabel}
          />
        )}
        <div
          id={HEADER_IDS.searchStatus}
          class="site-header__search-status"
          role="status"
          aria-live="polite"
          aria-atomic="true"
          data-search-status=""
          hidden
        >
          <div
            class="site-inline-loading site-search-inline-loading"
            data-search-loading=""
            hidden
          >
            <div class="site-inline-loading__animation">
              <div class="site-loading site-loading--small">
                <svg
                  class="site-loading__svg"
                  viewBox="0 0 100 100"
                  aria-hidden="true"
                >
                  <circle
                    class="site-loading__background"
                    cx="50"
                    cy="50"
                    r="44"
                  />
                  <circle
                    class="site-loading__stroke"
                    cx="50"
                    cy="50"
                    r="44"
                  />
                </svg>
              </div>
            </div>
            <p
              class="site-inline-loading__text"
              data-search-loading-text=""
            >
              {t.site.searchLoadingLabel}
            </p>
          </div>
          <p
            class="site-header__search-status-text"
            data-search-status-text=""
            hidden
          />
          <div
            class="site-notification site-notification--low-contrast site-notification--info site-search-notification"
            data-search-notification=""
            data-search-notification-tone="info"
            hidden
          >
            <div class="site-notification__details">
              <span
                class="site-search-notification-icons"
                aria-hidden="true"
              >
                <SiteIcon
                  name="info"
                  className="site-search-notification-icon site-search-notification-icon--info"
                  width={20}
                  height={20}
                />
                <SiteIcon
                  name="alert-fill"
                  className="site-search-notification-icon site-search-notification-icon--warning"
                  width={20}
                  height={20}
                />
              </span>
              <div class="site-notification__text-wrapper">
                <p
                  class="site-notification__title"
                  data-search-notification-title=""
                />
                <p
                  class="site-notification__subtitle"
                  data-search-notification-subtitle=""
                />
              </div>
            </div>
          </div>
        </div>
        <div
          id={HEADER_IDS.searchContainer}
          class={headerClass(
            variant,
            "site-header__search-root",
            "search-root",
          )}
          data-search-root=""
          aria-busy="false"
          data-search-loading-label={t.site.searchLoadingLabel}
          data-search-loading-title={t.site.searchLoadingTitle}
          data-search-no-results-label={t.site.searchNoResultsLabel}
          data-search-one-result-label={t.site.searchOneResultLabel}
          data-search-many-results-label={t.site.searchManyResultsLabel}
          data-search-unavailable-label={t.site.searchUnavailableLabel}
          data-search-unavailable-title={t.site.searchUnavailableTitle}
          data-search-offline-label={t.site.searchOfflineLabel}
          data-search-offline-title={t.site.searchOfflineTitle}
          data-search-retry-label={t.site.searchRetryLabel}
        >
          <div
            class="site-search-skeleton"
            data-search-skeleton=""
            aria-hidden="true"
          >
            <span class="site-skeleton__text site-search-skeleton-line" />
            <span class="site-skeleton__text site-search-skeleton-line" />
            <span class="site-skeleton__text site-search-skeleton-line" />
          </div>
        </div>
      </div>
    </div>
  );
}

function renderSideNav(
  items: readonly NavigationItem[],
  homeUrl: string,
  siteName: string,
  t: Translations,
  variant: HeaderVariantState,
): El {
  return (
    <aside
      id={HEADER_IDS.sideNav}
      class={headerClass(variant, "site-side-nav", "drawer")}
      role="dialog"
      aria-modal="true"
      aria-label={t.site.mainNavigationAriaLabel}
      hidden
    >
      <nav
        class={headerClass(
          variant,
          "site-side-nav__navigation",
          "drawer-navigation",
        )}
      >
        <div
          class={headerClass(variant, "site-side-nav__header", "drawer-header")}
        >
          <a href={homeUrl} class="site-side-nav__brand">{siteName}</a>
          <button
            type="button"
            class="site-side-nav__close"
            aria-label={t.site.closeLabel}
            data-side-nav-close=""
          >
            <SiteIcon
              name="x"
              className="site-side-nav__close-icon"
              width={18}
              height={18}
            />
          </button>
        </div>
        <div class="site-side-nav__menu-shell">
          <ul class="site-side-nav__items">
            {items.map(({ href, label, isCurrent }) => (
              <li
                class={`site-side-nav__item${
                  isCurrent ? " site-side-nav__item--current" : ""
                }`}
                key={href}
              >
                <a
                  href={href}
                  class="site-side-nav__link"
                  {...(isCurrent ? { "aria-current": "page" as const } : {})}
                >
                  <span class="site-side-nav__link-text">{label}</span>
                  <SiteIcon
                    name="arrow-right"
                    className="site-side-nav__link-icon"
                    width={18}
                    height={18}
                  />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </aside>
  );
}

// ── Editorial home brand markup ────────────────────────────────────────

function renderEditorialHomeBrand(
  homeUrl: string,
  siteName: string,
  t: Translations,
): El {
  return (
    <a href={homeUrl} class="site-header__brand editorial-home-header__name">
      <span class="editorial-home-header__brand-lockup">
        <span class="editorial-home-header__brand-wordmark">{siteName}</span>
        <span class="editorial-home-header__brand-meta">
          {t.home.eyebrow}
        </span>
      </span>
    </a>
  );
}

// ── Main export ────────────────────────────────────────────────────────

export default (
  { currentUrl, language, languageAlternates = {} }: HeaderProps,
): El => {
  const { homeUrl, translations: t } = getPageContext(language);
  const siteName = getSiteName(language);
  const navItems = buildHeaderNavigation({ currentUrl, language });
  const isHome = currentUrl === homeUrl;
  const variant = resolveHeaderVariant(isHome);
  const actions = resolveHeaderActions(t, variant);

  return (
    <>
      <header
        class={cx("site-header", isHome && "site-header--editorial-home")}
      >
        <div class={headerClass(variant, "site-header__wrapper", "wrapper")}>
          <div class={headerClass(variant, "site-header__left", "left")}>
            <button
              type="button"
              class={headerClass(
                variant,
                "site-header__action site-header__menu-toggle",
                "menu-toggle",
              )}
              aria-label={t.site.menuToggleLabel}
              aria-expanded="false"
              aria-controls={HEADER_IDS.sideNav}
            >
              <SiteIcon
                name="three-bars"
                className={`${
                  resolveMenuIconClass(variant)
                } site-menu-icon--menu`}
                width={variant.menuIconSize}
                height={variant.menuIconSize}
              />
              <SiteIcon
                name="x"
                className={`${
                  resolveMenuIconClass(variant)
                } site-menu-icon--close`}
                width={variant.menuIconSize}
                height={variant.menuIconSize}
              />
            </button>

            {isHome ? renderEditorialHomeBrand(homeUrl, siteName, t) : (
              <>
                <a href={homeUrl} class="site-header__brand">{siteName}</a>
                <nav
                  class={headerClass(variant, "site-header__nav", "nav")}
                  aria-label={t.site.mainNavigationAriaLabel}
                >
                  {renderDesktopNavigationMenu(navItems, variant)}
                </nav>
              </>
            )}
          </div>

          {isHome && (
            <nav
              class={headerClass(variant, "site-header__nav", "nav")}
              aria-label={t.site.mainNavigationAriaLabel}
            >
              {renderDesktopNavigationMenu(navItems, variant)}
            </nav>
          )}

          <div class={headerClass(variant, "site-header__global", "global")}>
            {actions.map((action) => renderHeaderAction(action))}
          </div>
        </div>
      </header>

      {renderLanguagePanel(language, languageAlternates, t, variant)}
      {renderSearchPanel(t, variant)}
      {renderSideNav(
        navItems,
        homeUrl,
        siteName,
        t,
        variant,
      )}
      <div class="site-side-nav__overlay" aria-hidden="true"></div>
    </>
  );
};
