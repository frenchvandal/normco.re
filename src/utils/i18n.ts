/** Shared internationalization primitives for the site UI. */

/** Supported language codes available in the site. */
export const SUPPORTED_LANGUAGES = ["en", "fr"] as const;

/** Canonical language type used across pages, components, and scripts. */
export type SiteLanguage = (typeof SUPPORTED_LANGUAGES)[number];

/** Fallback language used when no supported language can be resolved. */
export const DEFAULT_LANGUAGE: SiteLanguage = "en";

const SUPPORTED_LANGUAGE_SET = new Set<string>(SUPPORTED_LANGUAGES);

/** Flag emoji labels displayed in the native language selector options. */
export const LANGUAGE_FLAG_EMOJI = {
  en: "🇬🇧",
  fr: "🇫🇷",
} as const satisfies Record<SiteLanguage, string>;

/** OpenMoji icon names used to render the active language flag in the header. */
export const LANGUAGE_FLAG_ICON = {
  en: "1F1EC-1F1E7",
  fr: "1F1EB-1F1F7",
} as const satisfies Record<SiteLanguage, string>;

/** Translation contract used by shared UI components and pages. */
export type SiteTranslations = {
  readonly site: {
    readonly skipToContent: string;
    readonly mainNavigationAriaLabel: string;
    readonly siteLinksAriaLabel: string;
    readonly languageSelectLabel: string;
    readonly languageSelectAriaLabel: string;
    readonly themeToggleLabel: string;
    readonly switchToLightThemeLabel: string;
    readonly switchToDarkThemeLabel: string;
    readonly repositoryLinkAriaLabel: string;
    readonly rssLinkAriaLabel: string;
  };
  readonly navigation: {
    readonly writing: string;
    readonly about: string;
  };
  readonly languageNames: Record<SiteLanguage, string>;
  readonly home: {
    readonly eyebrow: string;
    readonly title: string;
    readonly lead: string;
    readonly recentHeading: string;
    readonly archiveLinkLabel: string;
    readonly emptyState: string;
  };
  readonly archive: {
    readonly eyebrow: string;
    readonly title: string;
    readonly lead: string;
    readonly activityAriaLabel: string;
    readonly yearsAriaLabel: string;
    readonly emptyState: string;
  };
  readonly about: {
    readonly eyebrow: string;
    readonly title: string;
    readonly lead: string;
    readonly intro: string;
    readonly body: string;
    readonly feedsIntro: string;
  };
  readonly post: {
    readonly navigationAriaLabel: string;
    readonly previousLabel: string;
    readonly nextLabel: string;
  };
  readonly offline: {
    readonly ariaLabel: string;
    readonly title: string;
    readonly lead: string;
    readonly backToHome: string;
  };
  readonly notFound: {
    readonly title: string;
    readonly description: string;
    readonly message: string;
    readonly backToHome: string;
  };
};

const SITE_TRANSLATIONS = {
  en: {
    site: {
      skipToContent: "Skip to content",
      mainNavigationAriaLabel: "Main navigation",
      siteLinksAriaLabel: "Site links",
      languageSelectLabel: "Language",
      languageSelectAriaLabel: "Select language",
      themeToggleLabel: "Toggle color theme",
      switchToLightThemeLabel: "Switch to light theme",
      switchToDarkThemeLabel: "Switch to dark theme",
      repositoryLinkAriaLabel: "Open GitHub repository",
      rssLinkAriaLabel: "Open RSS feed",
    },
    navigation: {
      writing: "Writing",
      about: "About",
    },
    languageNames: {
      en: "English",
      fr: "Français",
    },
    home: {
      eyebrow: "Personal blog",
      title: "Writing about things that matter.",
      lead:
        "A personal blog by Phiphi - software, culture, and everyday life from Chengdu.",
      recentHeading: "Recent writing",
      archiveLinkLabel: "View archive",
      emptyState: "No posts published yet.",
    },
    archive: {
      eyebrow: "Archive",
      title: "Writing",
      lead: "All posts grouped by year, newest first.",
      activityAriaLabel: "Writing activity",
      yearsAriaLabel: "Archive years",
      emptyState: "No posts published yet.",
    },
    about: {
      eyebrow: "Profile",
      title: "About",
      lead: "Notes on who I am and why this blog exists.",
      intro:
        "Hi, I'm Phiphi. I'm a software person living in Chengdu, China - a city known for its pandas, spicy food, and unhurried pace of life.",
      body:
        "I write about software, tools, language, and whatever else catches my attention. This site has no comments, no analytics, and no newsletter. It's just a place to think out loud.",
      feedsIntro: "You can follow along via",
    },
    post: {
      navigationAriaLabel: "Post navigation",
      previousLabel: "Previous",
      nextLabel: "Next",
    },
    offline: {
      ariaLabel: "Offline fallback",
      title: "You are offline.",
      lead: "The latest page could not be loaded right now.",
      backToHome: "Back to home",
    },
    notFound: {
      title: "Page not found",
      description: "The page you requested does not exist.",
      message: "Page not found.",
      backToHome: "Back to home",
    },
  },
  fr: {
    site: {
      skipToContent: "Aller au contenu",
      mainNavigationAriaLabel: "Navigation principale",
      siteLinksAriaLabel: "Liens du site",
      languageSelectLabel: "Langue",
      languageSelectAriaLabel: "Choisir la langue",
      themeToggleLabel: "Basculer le thème de couleur",
      switchToLightThemeLabel: "Passer au thème clair",
      switchToDarkThemeLabel: "Passer au thème sombre",
      repositoryLinkAriaLabel: "Ouvrir le dépôt GitHub",
      rssLinkAriaLabel: "Ouvrir le flux RSS",
    },
    navigation: {
      writing: "Articles",
      about: "À propos",
    },
    languageNames: {
      en: "English",
      fr: "Français",
    },
    home: {
      eyebrow: "Blog personnel",
      title: "Écrire sur ce qui compte.",
      lead:
        "Un blog personnel de Phiphi - logiciel, culture et vie quotidienne depuis Chengdu.",
      recentHeading: "Articles récents",
      archiveLinkLabel: "Voir les archives",
      emptyState: "Aucun article publié pour le moment.",
    },
    archive: {
      eyebrow: "Archives",
      title: "Articles",
      lead:
        "Tous les articles, regroupés par année, du plus récent au plus ancien.",
      activityAriaLabel: "Activité des articles",
      yearsAriaLabel: "Années d'archives",
      emptyState: "Aucun article publié pour le moment.",
    },
    about: {
      eyebrow: "Profil",
      title: "À propos",
      lead: "Qui je suis et pourquoi ce blog existe.",
      intro:
        "Salut, moi c'est Phiphi. Je vis à Chengdu, en Chine - une ville connue pour ses pandas, sa cuisine épicée et son rythme de vie plus calme.",
      body:
        "J'écris sur le logiciel, les outils, la langue, et tout ce qui attire mon attention. Ce site n'a ni commentaires, ni analytics, ni newsletter. C'est juste un endroit pour penser à voix haute.",
      feedsIntro: "Tu peux suivre les publications via",
    },
    post: {
      navigationAriaLabel: "Navigation entre articles",
      previousLabel: "Précédent",
      nextLabel: "Suivant",
    },
    offline: {
      ariaLabel: "Page hors ligne",
      title: "Vous êtes hors ligne.",
      lead: "La dernière page n'a pas pu être chargée pour le moment.",
      backToHome: "Retour à l'accueil",
    },
    notFound: {
      title: "Page introuvable",
      description: "La page demandée n'existe pas.",
      message: "Page introuvable.",
      backToHome: "Retour à l'accueil",
    },
  },
} as const satisfies Record<SiteLanguage, SiteTranslations>;

/** Returns true when a value is one of the supported language codes. */
export function isSiteLanguage(value: unknown): value is SiteLanguage {
  return typeof value === "string" && SUPPORTED_LANGUAGE_SET.has(value);
}

/** Resolves a language value to a supported code, with English fallback. */
export function resolveSiteLanguage(value: unknown): SiteLanguage {
  return isSiteLanguage(value) ? value : DEFAULT_LANGUAGE;
}

/** Returns the path prefix for a language (`""` for default, `/fr` for French). */
export function getLanguagePrefix(language: SiteLanguage): string {
  return language === DEFAULT_LANGUAGE ? "" : `/${language}`;
}

/** Returns a site URL translated to the target language. */
export function getLocalizedUrl(path: string, language: SiteLanguage): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (language === DEFAULT_LANGUAGE) {
    return normalizedPath;
  }

  if (normalizedPath === "/") {
    return `${getLanguagePrefix(language)}/`;
  }

  return `${getLanguagePrefix(language)}${normalizedPath}`;
}

/** Returns the translation bundle for a language. */
export function getSiteTranslations(language: SiteLanguage): SiteTranslations {
  return SITE_TRANSLATIONS[language];
}

/** Formats a reading-time label localized to the target language. */
export function formatReadingTime(
  minutes: number,
  language: SiteLanguage,
): string {
  return language === "fr"
    ? `${minutes}\u00a0min de lecture`
    : `${minutes} min read`;
}

/** Formats a yearly post-count summary localized to the target language. */
export function formatPostCount(count: number, language: SiteLanguage): string {
  if (language === "fr") {
    return count === 1 ? "1 article publié" : `${count} articles publiés`;
  }

  return count === 1 ? "1 post published" : `${count} posts published`;
}
