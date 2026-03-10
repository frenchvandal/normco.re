/** Shared internationalization primitives for the site UI. */

/** Supported language codes available in the site. */
export const SUPPORTED_LANGUAGES = [
  "en",
  "fr",
  "zhHans",
  "zhHant",
] as const;

/** Canonical language type used across pages, components, and scripts. */
export type SiteLanguage = (typeof SUPPORTED_LANGUAGES)[number];

/** Fallback language used when no supported language can be resolved. */
export const DEFAULT_LANGUAGE: SiteLanguage = "en";

const SUPPORTED_LANGUAGE_SET = new Set<string>(SUPPORTED_LANGUAGES);

/** BCP 47 tags written to the HTML `lang` attribute and feed metadata. */
export const LANGUAGE_TAG = {
  en: "en",
  fr: "fr",
  zhHans: "zh-Hans",
  zhHant: "zh-Hant",
} as const satisfies Record<SiteLanguage, string>;

/** Canonical language values stored in page data (`data.lang`). */
export const LANGUAGE_DATA_CODE = {
  en: "en",
  fr: "fr",
  zhHans: "zh-hans",
  zhHant: "zh-hant",
} as const satisfies Record<SiteLanguage, string>;

/** URL prefixes used by the multilanguage plugin for each language. */
export const LANGUAGE_PREFIX = {
  en: "",
  fr: "/fr",
  zhHans: "/zh-hans",
  zhHant: "/zh-hant",
} as const satisfies Record<SiteLanguage, string>;

const LANGUAGE_ALIASES: Readonly<Record<string, SiteLanguage>> = {
  "zh-hans": "zhHans",
  "zh_hans": "zhHans",
  "zh-hant": "zhHant",
  "zh_hant": "zhHant",
};

/** Flag emoji labels displayed in the native language selector options. */
export const LANGUAGE_FLAG_EMOJI = {
  en: "🇬🇧",
  fr: "🇫🇷",
  zhHans: "🇨🇳",
  zhHant: "🇹🇼",
} as const satisfies Record<SiteLanguage, string>;

/** OpenMoji icon names used to render the active language flag in the header. */
export const LANGUAGE_FLAG_ICON = {
  en: "1F1EC-1F1E7",
  fr: "1F1EB-1F1F7",
  zhHans: "1F1E8-1F1F3",
  zhHant: "1F1F9-1F1FC",
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
    readonly home: string;
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
      home: "Home",
      writing: "Writing",
      about: "About",
    },
    languageNames: {
      en: "English",
      fr: "Français",
      zhHans: "Simplified Chinese",
      zhHant: "Traditional Chinese",
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
      home: "Accueil",
      writing: "Articles",
      about: "À propos",
    },
    languageNames: {
      en: "English",
      fr: "Français",
      zhHans: "Chinois simplifié",
      zhHant: "Chinois traditionnel",
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
  zhHans: {
    site: {
      skipToContent: "跳转到内容",
      mainNavigationAriaLabel: "主导航",
      siteLinksAriaLabel: "站点链接",
      languageSelectLabel: "语言",
      languageSelectAriaLabel: "选择语言",
      themeToggleLabel: "切换颜色主题",
      switchToLightThemeLabel: "切换到浅色主题",
      switchToDarkThemeLabel: "切换到深色主题",
      repositoryLinkAriaLabel: "打开 GitHub 仓库",
      rssLinkAriaLabel: "打开 RSS 订阅",
    },
    navigation: {
      home: "首页",
      writing: "文章",
      about: "关于",
    },
    languageNames: {
      en: "English",
      fr: "Français",
      zhHans: "简体中文",
      zhHant: "繁體中文",
    },
    home: {
      eyebrow: "个人博客",
      title: "写下真正重要的事。",
      lead: "Phiphi 的个人博客，记录软件、文化与在成都的日常生活。",
      recentHeading: "最新文章",
      archiveLinkLabel: "查看归档",
      emptyState: "暂时还没有已发布的文章。",
    },
    archive: {
      eyebrow: "归档",
      title: "文章",
      lead: "所有文章按年份分组，最新优先。",
      activityAriaLabel: "文章活动",
      yearsAriaLabel: "归档年份",
      emptyState: "暂时还没有已发布的文章。",
    },
    about: {
      eyebrow: "个人简介",
      title: "关于",
      lead: "关于我，以及这个博客为何存在。",
      intro:
        "你好，我是 Phiphi，一名住在中国成都的软件从业者。成都以熊猫、辛辣美食和从容的生活节奏闻名。",
      body:
        "我会写软件、工具、语言，以及任何吸引我注意的主题。这里没有评论、没有统计分析、也没有 newsletter。这里只是我公开思考的地方。",
      feedsIntro: "你可以通过以下方式订阅",
    },
    post: {
      navigationAriaLabel: "文章导航",
      previousLabel: "上一篇",
      nextLabel: "下一篇",
    },
    offline: {
      ariaLabel: "离线后备页面",
      title: "你当前处于离线状态。",
      lead: "暂时无法加载最新页面。",
      backToHome: "返回首页",
    },
    notFound: {
      title: "页面不存在",
      description: "你请求的页面不存在。",
      message: "页面不存在。",
      backToHome: "返回首页",
    },
  },
  zhHant: {
    site: {
      skipToContent: "跳至內容",
      mainNavigationAriaLabel: "主導覽",
      siteLinksAriaLabel: "網站連結",
      languageSelectLabel: "語言",
      languageSelectAriaLabel: "選擇語言",
      themeToggleLabel: "切換色彩主題",
      switchToLightThemeLabel: "切換到淺色主題",
      switchToDarkThemeLabel: "切換到深色主題",
      repositoryLinkAriaLabel: "開啟 GitHub 儲存庫",
      rssLinkAriaLabel: "開啟 RSS 訂閱",
    },
    navigation: {
      home: "首頁",
      writing: "文章",
      about: "關於",
    },
    languageNames: {
      en: "English",
      fr: "Français",
      zhHans: "简体中文",
      zhHant: "繁體中文",
    },
    home: {
      eyebrow: "個人部落格",
      title: "寫下真正重要的事。",
      lead: "Phiphi 的個人部落格，記錄軟體、文化與在成都的日常生活。",
      recentHeading: "最新文章",
      archiveLinkLabel: "查看彙整",
      emptyState: "目前尚無已發佈文章。",
    },
    archive: {
      eyebrow: "彙整",
      title: "文章",
      lead: "所有文章依年份分組，最新優先。",
      activityAriaLabel: "文章活動",
      yearsAriaLabel: "彙整年份",
      emptyState: "目前尚無已發佈文章。",
    },
    about: {
      eyebrow: "個人簡介",
      title: "關於",
      lead: "關於我是誰，以及這個部落格為何存在。",
      intro:
        "你好，我是 Phiphi，一位住在中國成都的軟體工作者。成都以熊貓、辛香料理與從容節奏聞名。",
      body:
        "我會寫軟體、工具、語言，以及任何吸引我注意的主題。這裡沒有留言、沒有分析追蹤、也沒有電子報。這裡只是我公開思考的地方。",
      feedsIntro: "你可以透過以下方式訂閱",
    },
    post: {
      navigationAriaLabel: "文章導覽",
      previousLabel: "上一篇",
      nextLabel: "下一篇",
    },
    offline: {
      ariaLabel: "離線備援頁面",
      title: "你目前處於離線狀態。",
      lead: "目前無法載入最新頁面。",
      backToHome: "返回首頁",
    },
    notFound: {
      title: "找不到頁面",
      description: "你要求的頁面不存在。",
      message: "找不到頁面。",
      backToHome: "返回首頁",
    },
  },
} as const satisfies Record<SiteLanguage, SiteTranslations>;

/** Returns true when a value is one of the supported language codes. */
export function isSiteLanguage(value: unknown): value is SiteLanguage {
  return typeof value === "string" && SUPPORTED_LANGUAGE_SET.has(value);
}

/** Tries to resolve a language-like value to a supported site language. */
export function tryResolveSiteLanguage(
  value: unknown,
): SiteLanguage | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  if (isSiteLanguage(value)) {
    return value;
  }

  const normalized = value.trim().toLowerCase();
  return LANGUAGE_ALIASES[normalized];
}

/** Resolves a language value to a supported code, with English fallback. */
export function resolveSiteLanguage(value: unknown): SiteLanguage {
  return tryResolveSiteLanguage(value) ?? DEFAULT_LANGUAGE;
}

/** Returns the language tag used in HTML and feed metadata. */
export function getLanguageTag(language: SiteLanguage): string {
  return LANGUAGE_TAG[language];
}

/** Returns the canonical value used in page metadata and search queries. */
export function getLanguageDataCode(language: SiteLanguage): string {
  return LANGUAGE_DATA_CODE[language];
}

/** Returns the path prefix for a language (`""` for default). */
export function getLanguagePrefix(language: SiteLanguage): string {
  return LANGUAGE_PREFIX[language];
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
  if (language === "fr") {
    return `${minutes}\u00a0min de lecture`;
  }

  if (language === "zhHans") {
    return `${minutes} 分钟阅读`;
  }

  if (language === "zhHant") {
    return `${minutes} 分鐘閱讀`;
  }

  return `${minutes} min read`;
}

/** Formats a yearly post-count summary localized to the target language. */
export function formatPostCount(count: number, language: SiteLanguage): string {
  if (language === "fr") {
    return count === 1 ? "1 article publié" : `${count} articles publiés`;
  }

  if (language === "zhHans") {
    return `${count} 篇文章`;
  }

  if (language === "zhHant") {
    return `${count} 篇文章`;
  }

  return count === 1 ? "1 post published" : `${count} posts published`;
}
