/**
 * Shared internationalization primitives for the site UI.
 *
 * ## Internal vs. external language key design
 *
 * This module uses two parallel conventions for language codes, each serving a
 * distinct purpose:
 *
 * - **Internal TypeScript keys** (`SiteLanguage` type): `"en"`, `"fr"`,
 *   `"zhHans"`, `"zhHant"`. These are valid JavaScript identifiers used as
 *   object keys throughout the codebase (lookup tables, component props, page
 *   data). The camelCase Chinese variants avoid the hyphen that would require
 *   bracket notation everywhere.
 *
 * - **External codes** (URLs, HTML `lang`, feed metadata): `"zh-hans"`,
 *   `"zh-hant"`. These follow BCP 47 / browser conventions and are used in URL
 *   prefixes (`LANGUAGE_PREFIX`), HTML `lang` attributes (`LANGUAGE_TAG`), and
 *   page data keys (`LANGUAGE_DATA_CODE`).
 *
 * The mapping between the two spaces is handled by `LANGUAGE_DATA_CODE`,
 * `LANGUAGE_ALIASES`, and the `MULTILANGUAGE_DATA_ALIASES` preprocess hook in
 * `_config.ts`. Adding a new Chinese script variant would require updates in
 * all four locations.
 */

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

/** Translation contract used by shared UI components and pages. */
export type SiteTranslations = {
  readonly site: {
    readonly skipToContent: string;
    readonly mainNavigationAriaLabel: string;
    readonly siteLinksAriaLabel: string;
    readonly menuToggleLabel: string;
    readonly searchLabel: string;
    readonly searchLoadingLabel: string;
    readonly searchLoadingTitle: string;
    readonly searchNoResultsLabel: string;
    readonly searchOneResultLabel: string;
    readonly searchManyResultsLabel: string;
    readonly searchUnavailableLabel: string;
    readonly searchUnavailableTitle: string;
    readonly searchOfflineLabel: string;
    readonly searchOfflineTitle: string;
    readonly searchRetryLabel: string;
    readonly languageSelectLabel: string;
    readonly languageSelectAriaLabel: string;
    readonly themeToggleLabel: string;
    readonly switchToLightThemeLabel: string;
    readonly switchToDarkThemeLabel: string;
    readonly followSystemThemeLabel: string;
    readonly repositoryLinkAriaLabel: string;
    readonly rssLinkAriaLabel: string;
    readonly syndicationPageLinkAriaLabel: string;
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
    readonly emptyStateTitle: string;
    readonly emptyState: string;
  };
  readonly archive: {
    readonly eyebrow: string;
    readonly title: string;
    readonly lead: string;
    readonly activityAriaLabel: string;
    readonly yearsAriaLabel: string;
    readonly emptyStateTitle: string;
    readonly emptyState: string;
    readonly breadcrumbAriaLabel: string;
    readonly railAriaLabel: string;
    readonly paginationAriaLabel: string;
    readonly paginationItemsRange: string;
    readonly paginationPrevious: string;
    readonly paginationNext: string;
    readonly paginationPage: string;
    readonly viewLabel: string;
    readonly cardsViewLabel: string;
    readonly listViewLabel: string;
    readonly listDateHeading: string;
    readonly listTitleHeading: string;
    readonly listReadingHeading: string;
  };
  readonly about: {
    readonly breadcrumbAriaLabel: string;
    readonly eyebrow: string;
    readonly title: string;
    readonly lead: string;
    readonly intro: string;
    readonly body: string;
    readonly feedsIntro: string;
    readonly railAriaLabel: string;
    readonly contactTitle: string;
    readonly contactOpenQrLabel: string;
    readonly contactDownloadJpgLabel: string;
    readonly contactCloseLabel: string;
    readonly contactTelegramLabel: string;
    readonly contactWechatLabel: string;
    readonly contactTelegramQrAlt: string;
    readonly contactWechatQrAlt: string;
    readonly atAGlanceTitle: string;
    readonly locationLabel: string;
    readonly locationValue: string;
    readonly topicsLabel: string;
    readonly topicsValue: string;
    readonly languagesLabel: string;
    readonly languagesValue: string;
    readonly siteNotesTitle: string;
    readonly siteNoteOne: string;
    readonly siteNoteTwo: string;
    readonly siteNoteThree: string;
    readonly pictogramTitle: string;
    readonly pictogramCaption: string;
  };
  readonly feeds: {
    readonly breadcrumbAriaLabel: string;
    readonly eyebrow: string;
    readonly title: string;
    readonly lead: string;
    readonly intro: string;
    readonly cardsAriaLabel: string;
    readonly openAction: string;
    readonly copyAction: string;
    readonly copiedAction: string;
    readonly errorAction: string;
    readonly copiedStatusMessage: string;
    readonly errorStatusMessage: string;
    readonly copyNoticeTitle: string;
    readonly errorNoticeTitle: string;
    readonly tabsAriaLabel: string;
    readonly endpointsTabLabel: string;
    readonly guidanceTabLabel: string;
    readonly viewLabel: string;
    readonly cardsViewLabel: string;
    readonly listViewLabel: string;
    readonly listFormatHeading: string;
    readonly listUrlHeading: string;
    readonly listUseHeading: string;
    readonly overviewCalloutEyebrow: string;
    readonly overviewCalloutTitle: string;
    readonly overviewCalloutBody: string;
    readonly guidanceLead: string;
    readonly guidanceReadersTitle: string;
    readonly guidanceReadersBody: string;
    readonly guidanceAutomationTitle: string;
    readonly guidanceAutomationBody: string;
    readonly guidanceDiscoveryTitle: string;
    readonly guidanceDiscoveryBody: string;
    readonly rssTitle: string;
    readonly rssDescription: string;
    readonly atomTitle: string;
    readonly atomDescription: string;
    readonly jsonTitle: string;
    readonly jsonDescription: string;
    readonly sitemapTitle: string;
    readonly sitemapDescription: string;
  };
  readonly tagPage: {
    readonly eyebrow: string;
    readonly breadcrumbAriaLabel: string;
    readonly railAriaLabel: string;
    readonly postsAriaLabel: string;
    readonly postsHeading: string;
    readonly archiveLinkLabel: string;
  };
  readonly post: {
    readonly breadcrumbAriaLabel: string;
    readonly navigationAriaLabel: string;
    readonly railAriaLabel: string;
    readonly previousLabel: string;
    readonly nextLabel: string;
    readonly tagsAriaLabel: string;
    readonly copyCodeLabel: string;
    readonly copyCodeFeedback: string;
    readonly copyCodeFailedFeedback: string;
    readonly summaryEyebrow: string;
    readonly summaryTitle: string;
    readonly publishedLabel: string;
    readonly readingLabel: string;
    readonly sectionsLabel: string;
    readonly outlineTitle: string;
    readonly outlineAriaLabel: string;
    readonly detailsTitle: string;
    readonly permalinkLabel: string;
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
    readonly heading: string;
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
      menuToggleLabel: "Open navigation menu",
      searchLabel: "Search",
      searchLoadingLabel: "Loading search results.",
      searchLoadingTitle: "Preparing search",
      searchNoResultsLabel: "No results found.",
      searchOneResultLabel: "[COUNT] result",
      searchManyResultsLabel: "[COUNT] results",
      searchUnavailableLabel: "Search is temporarily unavailable.",
      searchUnavailableTitle: "Search unavailable",
      searchOfflineLabel: "Search is unavailable while offline.",
      searchOfflineTitle: "Offline",
      searchRetryLabel: "Retry",
      languageSelectLabel: "Language",
      languageSelectAriaLabel: "Select language",
      themeToggleLabel: "Toggle color theme",
      switchToLightThemeLabel: "Switch to light theme",
      switchToDarkThemeLabel: "Switch to dark theme",
      followSystemThemeLabel: "Follow system theme",
      repositoryLinkAriaLabel: "Open GitHub repository",
      rssLinkAriaLabel: "Open RSS feed",
      syndicationPageLinkAriaLabel: "Open syndication page",
    },
    navigation: {
      home: "Home",
      writing: "Writing",
      about: "About",
    },
    languageNames: {
      en: "English",
      fr: "Français",
      zhHans: "简体中文",
      zhHant: "繁體中文",
    },
    home: {
      eyebrow: "Personal blog",
      title: "Writing about things that matter.",
      lead:
        "A personal blog by Phiphi—software, culture, and everyday life from Chengdu.",
      recentHeading: "Recent writing",
      archiveLinkLabel: "View archive",
      emptyStateTitle: "Nothing published yet.",
      emptyState: "No posts published yet.",
    },
    archive: {
      eyebrow: "Archive",
      title: "Writing",
      lead: "All posts grouped by year, newest first.",
      activityAriaLabel: "Writing activity",
      yearsAriaLabel: "Archive years",
      emptyStateTitle: "Archive is empty.",
      emptyState: "No posts published yet.",
      breadcrumbAriaLabel: "Archive breadcrumb",
      railAriaLabel: "Archive tools",
      paginationAriaLabel: "Archive pagination",
      paginationItemsRange: "{start}–{end} of {total} items",
      paginationPrevious: "Previous page",
      paginationNext: "Next page",
      paginationPage: "Page",
      viewLabel: "Archive view",
      cardsViewLabel: "Cards",
      listViewLabel: "List",
      listDateHeading: "Date",
      listTitleHeading: "Title",
      listReadingHeading: "Reading time",
    },
    about: {
      breadcrumbAriaLabel: "About breadcrumb",
      eyebrow: "Profile",
      title: "About",
      lead: "Notes on who I am and why this blog exists.",
      intro:
        "Hi, I’m Phiphi. I’m a software person living in Chengdu, China—a city known for its pandas, spicy food, and unhurried pace of life.",
      body:
        "I write about software, tools, language, and whatever else catches my attention. This site has no comments, no analytics, and no newsletter. It’s just a place to think out loud.",
      feedsIntro: "You can follow along via",
      railAriaLabel: "About details",
      contactTitle: "Contact",
      contactOpenQrLabel: "View QR code",
      contactDownloadJpgLabel: "Download QR Code",
      contactCloseLabel: "Close",
      contactTelegramLabel: "Telegram",
      contactWechatLabel: "WeChat",
      contactTelegramQrAlt: "Telegram QR code",
      contactWechatQrAlt: "WeChat QR code",
      atAGlanceTitle: "At a glance",
      locationLabel: "Based in",
      locationValue: "Chengdu, China",
      topicsLabel: "Writing on",
      topicsValue: "Software, language, culture, and everyday life",
      languagesLabel: "Available in",
      languagesValue:
        "English, French, Simplified Chinese, and Traditional Chinese",
      siteNotesTitle: "This site",
      siteNoteOne: "Static by default, fast by design.",
      siteNoteTwo: "Multilingual on purpose.",
      siteNoteThree: "No comments, no analytics, no newsletter.",
      pictogramTitle: "Field note",
      pictogramCaption: "It’s all so tiresome…",
    },
    feeds: {
      breadcrumbAriaLabel: "Syndication breadcrumb",
      eyebrow: "Endpoints",
      title: "Syndication",
      lead: "Structured endpoints for feeds and site indexing on normco.re.",
      intro:
        "Open a format directly or copy its URL for a reader, crawler, or script. Feed autodiscovery remains enabled in the site head.",
      cardsAriaLabel: "Syndication endpoints",
      openAction: "View",
      copyAction: "Copy",
      copiedAction: "Copied",
      errorAction: "Cannot copy",
      copiedStatusMessage: "[LABEL] URL copied",
      errorStatusMessage: "Cannot copy [LABEL] URL",
      copyNoticeTitle: "Copied",
      errorNoticeTitle: "Action failed",
      tabsAriaLabel: "Syndication sections",
      endpointsTabLabel: "Endpoints",
      guidanceTabLabel: "How to use",
      viewLabel: "Endpoint view",
      cardsViewLabel: "Cards",
      listViewLabel: "List",
      listFormatHeading: "Format",
      listUrlHeading: "URL",
      listUseHeading: "Best for",
      overviewCalloutEyebrow: "Quick take",
      overviewCalloutTitle: "Pick the right endpoint for the job.",
      overviewCalloutBody:
        "Cards stay editorial; the list view stays dense. Both expose the same feed inventory and copy actions.",
      guidanceLead:
        "Use the endpoint that matches your reader, automation, or indexing workflow.",
      guidanceReadersTitle: "For feed readers",
      guidanceReadersBody:
        "Choose RSS for broad compatibility, or Atom when you prefer richer XML metadata and self links.",
      guidanceAutomationTitle: "For scripts and tooling",
      guidanceAutomationBody:
        "Choose JSON Feed when you want lightweight parsing, typed fields, and modern automation workflows.",
      guidanceDiscoveryTitle: "For crawling and discovery",
      guidanceDiscoveryBody:
        "Use the sitemap for canonical URL discovery and rely on feed autodiscovery when readers inspect the document head.",
      rssTitle: "RSS feed",
      rssDescription:
        "Classic XML feed for feed readers and broad client compatibility.",
      atomTitle: "Atom feed",
      atomDescription:
        "Structured XML feed with richer metadata and self links.",
      jsonTitle: "JSON Feed",
      jsonDescription:
        "JSON Feed 1.1 output for modern apps, scripts, and custom tooling.",
      sitemapTitle: "Sitemap",
      sitemapDescription:
        "Canonical URL inventory for crawlers, validators, and indexing workflows.",
    },
    tagPage: {
      eyebrow: "Topic",
      breadcrumbAriaLabel: "Tag breadcrumb",
      railAriaLabel: "Tag tools",
      postsAriaLabel: "Tagged posts",
      postsHeading: "Posts",
      archiveLinkLabel: "Back to archive",
    },
    post: {
      breadcrumbAriaLabel: "Post breadcrumb",
      navigationAriaLabel: "Post navigation",
      railAriaLabel: "Post tools",
      previousLabel: "Previous",
      nextLabel: "Next",
      tagsAriaLabel: "Post tags",
      copyCodeLabel: "Copy code",
      copyCodeFeedback: "Code copied",
      copyCodeFailedFeedback: "Cannot copy code",
      summaryEyebrow: "At a glance",
      summaryTitle: "This post in context",
      publishedLabel: "Published",
      readingLabel: "Reading time",
      sectionsLabel: "Sections",
      outlineTitle: "On this page",
      outlineAriaLabel: "Table of contents",
      detailsTitle: "Publication details",
      permalinkLabel: "Permalink",
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
      heading: "Page not found",
      message: "The page you requested does not exist.",
      backToHome: "Back to home",
    },
  },
  fr: {
    site: {
      skipToContent: "Aller au contenu",
      mainNavigationAriaLabel: "Navigation principale",
      siteLinksAriaLabel: "Liens du site",
      menuToggleLabel: "Ouvrir le menu de navigation",
      searchLabel: "Recherche",
      searchLoadingLabel: "Chargement des résultats de recherche.",
      searchLoadingTitle: "Préparation de la recherche",
      searchNoResultsLabel: "Aucun résultat.",
      searchOneResultLabel: "[COUNT] résultat",
      searchManyResultsLabel: "[COUNT] résultats",
      searchUnavailableLabel: "La recherche est temporairement indisponible.",
      searchUnavailableTitle: "Recherche indisponible",
      searchOfflineLabel: "La recherche est indisponible hors ligne.",
      searchOfflineTitle: "Hors ligne",
      searchRetryLabel: "Réessayer",
      languageSelectLabel: "Langue",
      languageSelectAriaLabel: "Choisir la langue",
      themeToggleLabel: "Basculer le thème de couleur",
      switchToLightThemeLabel: "Passer au thème clair",
      switchToDarkThemeLabel: "Passer au thème sombre",
      followSystemThemeLabel: "Suivre le thème du système",
      repositoryLinkAriaLabel: "Ouvrir le dépôt GitHub",
      rssLinkAriaLabel: "Ouvrir le flux RSS",
      syndicationPageLinkAriaLabel: "Ouvrir la page de syndication",
    },
    navigation: {
      home: "Accueil",
      writing: "Articles",
      about: "À propos",
    },
    languageNames: {
      en: "English",
      fr: "Français",
      zhHans: "简体中文",
      zhHant: "繁體中文",
    },
    home: {
      eyebrow: "Blog personnel",
      title: "Écrire sur ce qui compte.",
      lead:
        "Un blog personnel de Phiphi — logiciel, culture et vie quotidienne depuis Chengdu.",
      recentHeading: "Articles récents",
      archiveLinkLabel: "Voir les archives",
      emptyStateTitle: "Rien n’est encore publié.",
      emptyState: "Aucun article publié pour le moment.",
    },
    archive: {
      eyebrow: "Archives",
      title: "Articles",
      lead:
        "Tous les articles, regroupés par année, du plus récent au plus ancien.",
      activityAriaLabel: "Activité des articles",
      yearsAriaLabel: "Années d’archives",
      emptyStateTitle: "Les archives sont vides.",
      emptyState: "Aucun article publié pour le moment.",
      breadcrumbAriaLabel: "Fil d’Ariane des archives",
      railAriaLabel: "Outils des archives",
      paginationAriaLabel: "Pagination des archives",
      paginationItemsRange: "{start}–{end} sur {total} éléments",
      paginationPrevious: "Page précédente",
      paginationNext: "Page suivante",
      paginationPage: "Page",
      viewLabel: "Vue des archives",
      cardsViewLabel: "Cartes",
      listViewLabel: "Liste",
      listDateHeading: "Date",
      listTitleHeading: "Titre",
      listReadingHeading: "Lecture",
    },
    about: {
      breadcrumbAriaLabel: "Fil d’Ariane À propos",
      eyebrow: "Profil",
      title: "À propos",
      lead: "Qui je suis et pourquoi ce blog existe.",
      intro:
        "Salut, moi, c’est Phiphi. Je vis à Chengdu, en Chine — une ville connue pour ses pandas, sa cuisine épicée et son rythme de vie plus calme.",
      body:
        "J’écris sur le logiciel, les outils, la langue et tout ce qui attire mon attention. Ce site n’a ni commentaires, ni analytics ni newsletter. C’est juste un endroit pour penser à voix haute.",
      feedsIntro: "Vous pouvez suivre les publications via",
      railAriaLabel: "Détails à propos",
      contactTitle: "Contact",
      contactOpenQrLabel: "Afficher le code QR",
      contactDownloadJpgLabel: "Télécharger le code QR",
      contactCloseLabel: "Fermer",
      contactTelegramLabel: "Telegram",
      contactWechatLabel: "WeChat",
      contactTelegramQrAlt: "Code QR Telegram",
      contactWechatQrAlt: "Code QR WeChat",
      atAGlanceTitle: "En bref",
      locationLabel: "Basé à",
      locationValue: "Chengdu, Chine",
      topicsLabel: "J’écris sur",
      topicsValue: "logiciel, langue, culture et vie quotidienne",
      languagesLabel: "Disponible en",
      languagesValue:
        "anglais, français, chinois simplifié et chinois traditionnel",
      siteNotesTitle: "Ce site",
      siteNoteOne: "Statique par défaut, rapide par conception.",
      siteNoteTwo: "Multilingue par intention.",
      siteNoteThree: "Ni commentaires, ni analytics, ni newsletter.",
      pictogramTitle: "Repère",
      pictogramCaption: "C’est fatiguant…",
    },
    feeds: {
      breadcrumbAriaLabel: "Fil d’Ariane Syndication",
      eyebrow: "Points d’accès",
      title: "Syndication",
      lead:
        "Points d’accès structurés pour les flux et l’indexation de normco.re.",
      intro:
        "Ouvrez le format voulu directement ou copiez son URL pour un lecteur, un robot ou un script. L’autodécouverte des flux reste activée dans l’en-tête du site.",
      cardsAriaLabel: "Points d’accès de syndication",
      openAction: "Consulter",
      copyAction: "Copier",
      copiedAction: "Copié",
      errorAction: "Échec",
      copiedStatusMessage: "URL de [LABEL] copiée",
      errorStatusMessage: "Impossible de copier l’URL de [LABEL]",
      copyNoticeTitle: "Copié",
      errorNoticeTitle: "Action impossible",
      tabsAriaLabel: "Sections de syndication",
      endpointsTabLabel: "Points d’accès",
      guidanceTabLabel: "Utilisation",
      viewLabel: "Vue des endpoints",
      cardsViewLabel: "Cartes",
      listViewLabel: "Liste",
      listFormatHeading: "Format",
      listUrlHeading: "URL",
      listUseHeading: "Usage",
      overviewCalloutEyebrow: "En bref",
      overviewCalloutTitle: "Choisir le bon endpoint selon le besoin.",
      overviewCalloutBody:
        "La vue cartes reste éditoriale; la vue liste reste dense. Les deux exposent le même inventaire et les mêmes actions de copie.",
      guidanceLead:
        "Choisissez le point d’accès adapté à votre lecteur, votre automatisation ou votre workflow d’indexation.",
      guidanceReadersTitle: "Pour les lecteurs de flux",
      guidanceReadersBody:
        "Privilégiez RSS pour la compatibilité la plus large, ou Atom si vous préférez des métadonnées XML plus riches et des liens self.",
      guidanceAutomationTitle: "Pour les scripts et l’outillage",
      guidanceAutomationBody:
        "Privilégiez JSON Feed si vous voulez un parsing léger, des champs structurés et des workflows modernes.",
      guidanceDiscoveryTitle: "Pour l’exploration et la découverte",
      guidanceDiscoveryBody:
        "Utilisez le sitemap pour la découverte canonique des URL et l’autodécouverte des feeds quand un lecteur inspecte l’en-tête du document.",
      rssTitle: "Flux RSS",
      rssDescription:
        "Flux XML classique pour les lecteurs RSS et la compatibilité la plus large.",
      atomTitle: "Flux Atom",
      atomDescription:
        "Flux XML structuré avec des métadonnées plus riches et des liens self.",
      jsonTitle: "JSON Feed",
      jsonDescription:
        "Sortie JSON Feed 1.1 pour les apps modernes, les scripts et l’outillage.",
      sitemapTitle: "Plan du site",
      sitemapDescription:
        "Inventaire canonique des URL pour les robots, validateurs et workflows d’indexation.",
    },
    tagPage: {
      eyebrow: "Sujet",
      breadcrumbAriaLabel: "Fil d’Ariane des étiquettes",
      railAriaLabel: "Outils des étiquettes",
      postsAriaLabel: "Articles étiquetés",
      postsHeading: "Articles",
      archiveLinkLabel: "Retour aux archives",
    },
    post: {
      breadcrumbAriaLabel: "Fil d’Ariane de l’article",
      navigationAriaLabel: "Navigation entre articles",
      railAriaLabel: "Outils de l’article",
      previousLabel: "Précédent",
      nextLabel: "Suivant",
      tagsAriaLabel: "Étiquettes de l’article",
      copyCodeLabel: "Copier le code",
      copyCodeFeedback: "Code copié",
      copyCodeFailedFeedback: "Impossible de copier le code",
      summaryEyebrow: "En bref",
      summaryTitle: "Cet article en contexte",
      publishedLabel: "Publié",
      readingLabel: "Temps de lecture",
      sectionsLabel: "Sections",
      outlineTitle: "Dans cette page",
      outlineAriaLabel: "Table des matières",
      detailsTitle: "Détails de publication",
      permalinkLabel: "Lien permanent",
    },
    offline: {
      ariaLabel: "Page hors ligne",
      title: "Vous êtes hors ligne.",
      lead: "La dernière page n’a pas pu être chargée pour le moment.",
      backToHome: "Retour à l’accueil",
    },
    notFound: {
      title: "Page introuvable",
      description: "La page demandée n’existe pas.",
      heading: "Page introuvable",
      message: "La page demandée n’existe pas.",
      backToHome: "Retour à l’accueil",
    },
  },
  zhHans: {
    site: {
      skipToContent: "跳转到内容",
      mainNavigationAriaLabel: "主导航",
      siteLinksAriaLabel: "站点链接",
      menuToggleLabel: "打开导航菜单",
      searchLabel: "搜索",
      searchLoadingLabel: "正在加载搜索结果。",
      searchLoadingTitle: "正在准备搜索",
      searchNoResultsLabel: "未找到结果。",
      searchOneResultLabel: "[COUNT] 个结果",
      searchManyResultsLabel: "[COUNT] 个结果",
      searchUnavailableLabel: "搜索暂时不可用。",
      searchUnavailableTitle: "搜索不可用",
      searchOfflineLabel: "离线时无法使用搜索。",
      searchOfflineTitle: "离线",
      searchRetryLabel: "重试",
      languageSelectLabel: "语言",
      languageSelectAriaLabel: "选择语言",
      themeToggleLabel: "切换颜色主题",
      switchToLightThemeLabel: "切换到浅色主题",
      switchToDarkThemeLabel: "切换到深色主题",
      followSystemThemeLabel: "跟随系统主题",
      repositoryLinkAriaLabel: "打开 GitHub 仓库",
      rssLinkAriaLabel: "打开 RSS 订阅",
      syndicationPageLinkAriaLabel: "打开聚合页面",
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
      emptyStateTitle: "还没有发布内容。",
      emptyState: "暂时还没有已发布的文章。",
    },
    archive: {
      eyebrow: "归档",
      title: "文章",
      lead: "所有文章按年份分组，最新优先。",
      activityAriaLabel: "文章活动",
      yearsAriaLabel: "归档年份",
      emptyStateTitle: "归档目前还是空的。",
      emptyState: "暂时还没有已发布的文章。",
      breadcrumbAriaLabel: "归档面包屑导航",
      railAriaLabel: "归档工具",
      paginationAriaLabel: "归档分页",
      paginationItemsRange: "共{total}项，第{start}–{end}项",
      paginationPrevious: "上一页",
      paginationNext: "下一页",
      paginationPage: "第",
      viewLabel: "归档视图",
      cardsViewLabel: "卡片",
      listViewLabel: "列表",
      listDateHeading: "日期",
      listTitleHeading: "标题",
      listReadingHeading: "阅读时间",
    },
    about: {
      breadcrumbAriaLabel: "关于页面面包屑导航",
      eyebrow: "个人简介",
      title: "关于",
      lead: "关于我，以及这个博客为何存在。",
      intro:
        "你好，我是 Phiphi，一名住在中国成都的软件从业者。成都以熊猫、辛辣美食和从容的生活节奏闻名。",
      body:
        "我会写软件、工具、语言，以及任何吸引我注意的主题。这里没有评论、没有统计分析、也没有 newsletter。这里只是我公开思考的地方。",
      feedsIntro: "你可以通过以下方式订阅",
      railAriaLabel: "关于页面侧栏",
      contactTitle: "联系",
      contactOpenQrLabel: "显示二维码",
      contactDownloadJpgLabel: "下载二维码",
      contactCloseLabel: "关闭",
      contactTelegramLabel: "电报",
      contactWechatLabel: "微信",
      contactTelegramQrAlt: "电报二维码",
      contactWechatQrAlt: "微信二维码",
      atAGlanceTitle: "快速了解",
      locationLabel: "所在地",
      locationValue: "中国成都",
      topicsLabel: "写作主题",
      topicsValue: "软件、语言、文化与日常生活",
      languagesLabel: "可阅读语言",
      languagesValue: "英语、法语、简体中文和繁体中文",
      siteNotesTitle: "关于这个站点",
      siteNoteOne: "默认静态，优先速度。",
      siteNoteTwo: "多语言是有意为之。",
      siteNoteThree: "没有评论、没有统计分析，也没有邮件通讯。",
      pictogramTitle: "旁注",
      pictogramCaption: "哎呀！这事儿真难搞哇……",
    },
    feeds: {
      breadcrumbAriaLabel: "聚合页面包屑导航",
      eyebrow: "端点",
      title: "聚合",
      lead: "用于访问 normco.re 订阅与索引入口的结构化端点。",
      intro:
        "可以直接打开所需格式，或复制其地址给阅读器、爬虫或脚本使用。站点头部中的 feed 自动发现仍然保留。",
      cardsAriaLabel: "聚合端点",
      openAction: "查看",
      copyAction: "复制",
      copiedAction: "已复制",
      errorAction: "无法复制",
      copiedStatusMessage: "已复制 [LABEL] URL",
      errorStatusMessage: "无法复制 [LABEL] URL",
      copyNoticeTitle: "已复制",
      errorNoticeTitle: "操作失败",
      tabsAriaLabel: "聚合分区",
      endpointsTabLabel: "端点",
      guidanceTabLabel: "使用说明",
      viewLabel: "端点视图",
      cardsViewLabel: "卡片",
      listViewLabel: "列表",
      listFormatHeading: "格式",
      listUrlHeading: "URL",
      listUseHeading: "适用场景",
      overviewCalloutEyebrow: "快速说明",
      overviewCalloutTitle: "按使用场景选择合适的端点。",
      overviewCalloutBody:
        "卡片视图更偏编辑表达，列表视图更适合快速扫读。两种视图暴露的是同一组 feed 与复制操作。",
      guidanceLead: "根据阅读器、自动化脚本或索引流程选择对应端点。",
      guidanceReadersTitle: "用于订阅阅读器",
      guidanceReadersBody:
        "追求广泛兼容性时选 RSS；偏好更丰富 XML 元数据与 self 链接时选 Atom。",
      guidanceAutomationTitle: "用于脚本与工具链",
      guidanceAutomationBody:
        "如果你需要轻量解析、结构化字段和现代自动化流程，优先使用 JSON Feed。",
      guidanceDiscoveryTitle: "用于抓取与发现",
      guidanceDiscoveryBody:
        "站点地图适合发现规范 URL；阅读器检查页面 head 时则可依赖 feed 自动发现。",
      rssTitle: "RSS 订阅",
      rssDescription: "经典 XML feed，兼容各类阅读器与聚合器。",
      atomTitle: "Atom 订阅",
      atomDescription: "带有更丰富元数据与 self 链接的 XML feed。",
      jsonTitle: "JSON Feed",
      jsonDescription: "面向现代应用、脚本与工具的 JSON Feed 1.1 输出。",
      sitemapTitle: "站点地图",
      sitemapDescription: "供爬虫、校验器与索引流程使用的规范 URL 清单。",
    },
    tagPage: {
      eyebrow: "主题",
      breadcrumbAriaLabel: "标签面包屑导航",
      railAriaLabel: "标签工具",
      postsAriaLabel: "标签文章",
      postsHeading: "文章",
      archiveLinkLabel: "返回归档",
    },
    post: {
      breadcrumbAriaLabel: "文章面包屑导航",
      navigationAriaLabel: "文章导航",
      railAriaLabel: "文章工具",
      previousLabel: "上一篇",
      nextLabel: "下一篇",
      tagsAriaLabel: "文章标签",
      copyCodeLabel: "复制代码",
      copyCodeFeedback: "代码已复制",
      copyCodeFailedFeedback: "无法复制代码",
      summaryEyebrow: "概览",
      summaryTitle: "这篇文章的关键信息",
      publishedLabel: "发布日期",
      readingLabel: "阅读时间",
      sectionsLabel: "章节数",
      outlineTitle: "本页目录",
      outlineAriaLabel: "文章目录",
      detailsTitle: "发布详情",
      permalinkLabel: "固定链接",
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
      heading: "页面不存在",
      message: "你请求的页面不存在。",
      backToHome: "返回首页",
    },
  },
  zhHant: {
    site: {
      skipToContent: "跳至內容",
      mainNavigationAriaLabel: "主導覽",
      siteLinksAriaLabel: "網站連結",
      menuToggleLabel: "開啟導覽選單",
      searchLabel: "搜尋",
      searchLoadingLabel: "正在載入搜尋結果。",
      searchLoadingTitle: "正在準備搜尋",
      searchNoResultsLabel: "未找到結果。",
      searchOneResultLabel: "[COUNT] 個結果",
      searchManyResultsLabel: "[COUNT] 個結果",
      searchUnavailableLabel: "搜尋暫時無法使用。",
      searchUnavailableTitle: "搜尋不可用",
      searchOfflineLabel: "離線時無法使用搜尋。",
      searchOfflineTitle: "離線",
      searchRetryLabel: "重試",
      languageSelectLabel: "語言",
      languageSelectAriaLabel: "選擇語言",
      themeToggleLabel: "切換色彩主題",
      switchToLightThemeLabel: "切換到淺色主題",
      switchToDarkThemeLabel: "切換到深色主題",
      followSystemThemeLabel: "跟隨系統主題",
      repositoryLinkAriaLabel: "開啟 GitHub 儲存庫",
      rssLinkAriaLabel: "開啟 RSS 訂閱",
      syndicationPageLinkAriaLabel: "開啟聚合頁面",
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
      emptyStateTitle: "還沒有發佈內容。",
      emptyState: "目前尚無已發佈文章。",
    },
    archive: {
      eyebrow: "彙整",
      title: "文章",
      lead: "所有文章依年份分組，最新優先。",
      activityAriaLabel: "文章活動",
      yearsAriaLabel: "彙整年份",
      emptyStateTitle: "彙整目前是空的。",
      emptyState: "目前尚無已發佈文章。",
      breadcrumbAriaLabel: "彙整麵包屑導覽",
      railAriaLabel: "彙整工具",
      paginationAriaLabel: "彙整分頁",
      paginationItemsRange: "共{total}項，第{start}–{end}項",
      paginationPrevious: "上一頁",
      paginationNext: "下一頁",
      paginationPage: "第",
      viewLabel: "彙整視圖",
      cardsViewLabel: "卡片",
      listViewLabel: "列表",
      listDateHeading: "日期",
      listTitleHeading: "標題",
      listReadingHeading: "閱讀時間",
    },
    about: {
      breadcrumbAriaLabel: "關於頁面麵包屑導覽",
      eyebrow: "個人簡介",
      title: "關於",
      lead: "關於我是誰，以及這個部落格為何存在。",
      intro:
        "你好，我是 Phiphi，一位住在中國成都的軟體工作者。成都以熊貓、辛香料理與從容節奏聞名。",
      body:
        "我會寫軟體、工具、語言，以及任何吸引我注意的主題。這裡沒有留言、沒有分析追蹤、也沒有電子報。這裡只是我公開思考的地方。",
      feedsIntro: "你可以透過以下方式訂閱",
      railAriaLabel: "關於頁面側欄",
      contactTitle: "聯絡",
      contactOpenQrLabel: "顯示 QR 碼",
      contactDownloadJpgLabel: "下載 QR 碼",
      contactCloseLabel: "關閉",
      contactTelegramLabel: "Telegram",
      contactWechatLabel: "微信",
      contactTelegramQrAlt: "Telegram QR 碼",
      contactWechatQrAlt: "微信 QR 碼",
      atAGlanceTitle: "快速了解",
      locationLabel: "所在地",
      locationValue: "中國成都",
      topicsLabel: "寫作主題",
      topicsValue: "軟體、語言、文化與日常生活",
      languagesLabel: "可閱讀語言",
      languagesValue: "英語、法語、簡體中文和繁體中文",
      siteNotesTitle: "關於這個站點",
      siteNoteOne: "預設靜態，優先速度。",
      siteNoteTwo: "多語言是刻意為之。",
      siteNoteThree: "沒有留言、沒有分析追蹤，也沒有電子報。",
      pictogramTitle: "旁註",
      pictogramCaption: "哎呀！這事兒真難搞哇……",
    },
    feeds: {
      breadcrumbAriaLabel: "聚合頁麵包屑導覽",
      eyebrow: "端點",
      title: "聚合",
      lead: "用於存取 normco.re 訂閱與索引入口的結構化端點。",
      intro:
        "可以直接開啟所需格式，或複製其位址給閱讀器、爬蟲或腳本使用。站點頭部中的 feed 自動發現仍然保留。",
      cardsAriaLabel: "聚合端點",
      openAction: "查看",
      copyAction: "複製",
      copiedAction: "已複製",
      errorAction: "無法複製",
      copiedStatusMessage: "已複製 [LABEL] URL",
      errorStatusMessage: "無法複製 [LABEL] URL",
      copyNoticeTitle: "已複製",
      errorNoticeTitle: "操作失敗",
      tabsAriaLabel: "聚合分區",
      endpointsTabLabel: "端點",
      guidanceTabLabel: "使用說明",
      viewLabel: "端點視圖",
      cardsViewLabel: "卡片",
      listViewLabel: "列表",
      listFormatHeading: "格式",
      listUrlHeading: "URL",
      listUseHeading: "適用情境",
      overviewCalloutEyebrow: "快速說明",
      overviewCalloutTitle: "依使用情境選擇合適的端點。",
      overviewCalloutBody:
        "卡片視圖偏向編輯表達，列表視圖更利於快速掃讀。兩種視圖提供的是同一組 feed 與複製操作。",
      guidanceLead: "依據閱讀器、自動化腳本或索引流程選擇對應端點。",
      guidanceReadersTitle: "用於訂閱閱讀器",
      guidanceReadersBody:
        "若重視廣泛相容性請選 RSS；若偏好更豐富 XML 中繼資料與 self 連結則選 Atom。",
      guidanceAutomationTitle: "用於腳本與工具鏈",
      guidanceAutomationBody:
        "如果你需要輕量解析、結構化欄位與現代自動化流程，優先使用 JSON Feed。",
      guidanceDiscoveryTitle: "用於抓取與發現",
      guidanceDiscoveryBody:
        "網站地圖適合發現規範 URL；閱讀器檢查頁面 head 時則可依賴 feed 自動發現。",
      rssTitle: "RSS 訂閱",
      rssDescription: "經典 XML feed，相容各類閱讀器與聚合器。",
      atomTitle: "Atom 訂閱",
      atomDescription: "帶有更豐富中繼資料與 self 連結的 XML feed。",
      jsonTitle: "JSON Feed",
      jsonDescription: "面向現代應用、腳本與工具的 JSON Feed 1.1 輸出。",
      sitemapTitle: "網站地圖",
      sitemapDescription: "供爬蟲、驗證器與索引流程使用的規範 URL 清單。",
    },
    tagPage: {
      eyebrow: "主題",
      breadcrumbAriaLabel: "標籤麵包屑導覽",
      railAriaLabel: "標籤工具",
      postsAriaLabel: "標籤文章",
      postsHeading: "文章",
      archiveLinkLabel: "返回彙整",
    },
    post: {
      breadcrumbAriaLabel: "文章麵包屑導覽",
      navigationAriaLabel: "文章導覽",
      railAriaLabel: "文章工具",
      previousLabel: "上一篇",
      nextLabel: "下一篇",
      tagsAriaLabel: "文章標籤",
      copyCodeLabel: "複製程式碼",
      copyCodeFeedback: "程式碼已複製",
      copyCodeFailedFeedback: "無法複製程式碼",
      summaryEyebrow: "概覽",
      summaryTitle: "這篇文章的關鍵資訊",
      publishedLabel: "發佈日期",
      readingLabel: "閱讀時間",
      sectionsLabel: "章節數",
      outlineTitle: "本頁目錄",
      outlineAriaLabel: "文章目錄",
      detailsTitle: "發佈詳情",
      permalinkLabel: "固定連結",
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
      heading: "找不到頁面",
      message: "你要求的頁面不存在。",
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

const READING_TIME_FORMAT = {
  en: (m: number) => `${m} min read`,
  fr: (m: number) => `${m}\u00a0min de lecture`,
  zhHans: (m: number) => `${m} 分钟阅读`,
  zhHant: (m: number) => `${m} 分鐘閱讀`,
} as const satisfies Record<SiteLanguage, (m: number) => string>;

const POST_COUNT_FORMAT = {
  en: (n: number) => (n === 1 ? "1 post published" : `${n} posts published`),
  fr: (n: number) => n === 1 ? "1 article publié" : `${n} articles publiés`,
  zhHans: (n: number) => `${n} 篇文章`,
  zhHant: (n: number) => `${n} 篇文章`,
} as const satisfies Record<SiteLanguage, (n: number) => string>;

const TAG_PAGE_TITLE_FORMAT = {
  en: (tag: string) => `Tag: ${tag}`,
  fr: (tag: string) => `Étiquette\u00a0: ${tag}`,
  zhHans: (tag: string) => `标签：${tag}`,
  zhHant: (tag: string) => `標籤：${tag}`,
} as const satisfies Record<SiteLanguage, (tag: string) => string>;

const TAG_PAGE_DESCRIPTION_FORMAT = {
  en: (tag: string, count: number) =>
    `${POST_COUNT_FORMAT.en(count)} filed under ${tag}.`,
  fr: (tag: string, count: number) =>
    `${POST_COUNT_FORMAT.fr(count)} sous l’étiquette ${tag}.`,
  zhHans: (tag: string, count: number) =>
    `${tag} 主题下的 ${POST_COUNT_FORMAT.zhHans(count)}。`,
  zhHant: (tag: string, count: number) =>
    `${tag} 主題下的 ${POST_COUNT_FORMAT.zhHant(count)}。`,
} as const satisfies Record<
  SiteLanguage,
  (tag: string, count: number) => string
>;

/** Formats a reading-time label localized to the target language. */
export function formatReadingTime(
  minutes: number,
  language: SiteLanguage,
): string {
  return READING_TIME_FORMAT[language](minutes);
}

/** Formats a yearly post-count summary localized to the target language. */
export function formatPostCount(count: number, language: SiteLanguage): string {
  return POST_COUNT_FORMAT[language](count);
}

/** Formats the localized page title for a tag taxonomy route. */
export function formatTagPageTitle(
  tag: string,
  language: SiteLanguage,
): string {
  return TAG_PAGE_TITLE_FORMAT[language](tag);
}

/** Formats the localized meta description for a tag taxonomy route. */
export function formatTagPageDescription(
  tag: string,
  count: number,
  language: SiteLanguage,
): string {
  return TAG_PAGE_DESCRIPTION_FORMAT[language](tag, count);
}
