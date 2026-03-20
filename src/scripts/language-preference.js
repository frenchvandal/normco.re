// @ts-check
(() => {
  const currentScript = globalThis.document.currentScript;

  if (!(currentScript instanceof HTMLScriptElement)) {
    return;
  }

  const scriptElement = currentScript;

  const STORAGE_KEY = "preferred-language";
  const rawSupportedLanguages = scriptElement.dataset.supportedLanguages ??
    "en,fr,zhHans,zhHant";
  const supportedLanguages = rawSupportedLanguages
    .split(",")
    .map((language) => language.trim())
    .filter((language) => language.length > 0);

  if (supportedLanguages.length === 0) {
    return;
  }

  const supportedByKey = new Map(
    supportedLanguages.flatMap((language) => {
      const lowered = language.toLowerCase();
      const collapsed = lowered.replace(/[-_]/gu, "");
      return collapsed === lowered
        ? [[lowered, language]]
        : [[lowered, language], [collapsed, language]];
    }),
  );

  /**
   * @param {unknown} value
   * @returns {string | null}
   */
  function normalizeLanguage(value) {
    if (typeof value !== "string") {
      return null;
    }

    const normalizedValue = value.trim().toLowerCase();

    if (normalizedValue.length === 0) {
      return null;
    }

    const collapsedValue = normalizedValue.replace(/[-_]/gu, "");
    const directLanguage = supportedByKey.get(normalizedValue) ??
      supportedByKey.get(collapsedValue);

    if (directLanguage !== undefined) {
      return directLanguage;
    }

    const localeParts = normalizedValue.split(/[-_]/u).filter((part) =>
      part.length > 0
    );
    const base = localeParts[0];

    if (base === undefined) {
      return null;
    }

    if (base === "en" || base === "fr") {
      return supportedByKey.get(base) ?? null;
    }

    if (base !== "zh") {
      return null;
    }

    const script = localeParts.find((part) =>
      part === "hans" || part === "hant"
    );
    const region = localeParts.find((part) =>
      part === "cn" || part === "sg" || part === "tw" || part === "hk" ||
      part === "mo"
    );
    const preferredChineseCode = script === "hant" || region === "tw" ||
        region === "hk" ||
        region === "mo"
      ? "zhhant"
      : "zhhans";

    return supportedByKey.get(preferredChineseCode) ?? null;
  }

  const defaultLanguage = normalizeLanguage(
    scriptElement.dataset.defaultLanguage ?? "en",
  ) ?? supportedLanguages[0] ?? "en";
  const currentLanguage = normalizeLanguage(
    scriptElement.dataset.currentLanguage ??
      globalThis.document.documentElement.lang,
  ) ?? defaultLanguage;

  /**
   * @returns {Record<string, string>}
   */
  function parseAlternateUrls() {
    const rawAlternates = scriptElement.dataset.languageAlternates;

    if (typeof rawAlternates !== "string" || rawAlternates.length === 0) {
      return {};
    }

    try {
      const parsed = JSON.parse(rawAlternates);

      if (typeof parsed !== "object" || parsed === null) {
        return {};
      }

      /** @type {Record<string, string>} */
      const alternates = {};

      for (const [language, path] of Object.entries(parsed)) {
        const normalizedLanguage = normalizeLanguage(language);

        if (
          normalizedLanguage !== null &&
          typeof path === "string" &&
          path.length > 0
        ) {
          alternates[normalizedLanguage] = path;
        }
      }

      return alternates;
    } catch {
      return {};
    }
  }

  const alternateUrls = parseAlternateUrls();

  /**
   * @param {string} language
   * @returns {string}
   */
  function resolveTargetUrl(language) {
    const directMatch = alternateUrls[language];

    if (typeof directMatch === "string" && directMatch.length > 0) {
      return directMatch;
    }

    const defaultMatch = alternateUrls[defaultLanguage];

    if (typeof defaultMatch === "string" && defaultMatch.length > 0) {
      return defaultMatch;
    }

    return "/";
  }

  /**
   * @returns {string | null}
   */
  function readStoredLanguage() {
    try {
      return normalizeLanguage(globalThis.localStorage.getItem(STORAGE_KEY));
    } catch {
      return null;
    }
  }

  /**
   * @returns {string | null}
   */
  function resolveLocaleLanguage() {
    const localeCandidates = [
      ...(Array.isArray(globalThis.navigator.languages)
        ? globalThis.navigator.languages
        : []),
      globalThis.navigator.language,
    ];

    for (const locale of localeCandidates) {
      const language = normalizeLanguage(locale);

      if (language !== null) {
        return language;
      }
    }

    return null;
  }

  /**
   * @returns {string}
   */
  function resolvePreferredLanguage() {
    return readStoredLanguage() ?? resolveLocaleLanguage() ?? defaultLanguage;
  }

  /**
   * @returns {string}
   */
  function getCurrentPath() {
    return `${globalThis.location.pathname}${globalThis.location.search}`;
  }

  /**
   * @param {string} targetUrl
   * @returns {string}
   */
  function getTargetPath(targetUrl) {
    const absoluteTarget = new URL(targetUrl, globalThis.location.origin);
    return `${absoluteTarget.pathname}${absoluteTarget.search}`;
  }

  /**
   * @param {"assign" | "replace"} kind
   * @param {string} targetUrl
   * @returns {boolean}
   */
  function dispatchNavigationEvent(kind, targetUrl) {
    const navigationEvent = new CustomEvent("site:language-navigation", {
      bubbles: false,
      cancelable: true,
      detail: { kind, targetUrl },
    });

    return globalThis.document.dispatchEvent(navigationEvent);
  }

  /**
   * @param {string} targetUrl
   * @returns {void}
   */
  function replaceLocation(targetUrl) {
    if (!dispatchNavigationEvent("replace", targetUrl)) {
      return;
    }

    globalThis.location.replace(targetUrl);
  }

  const preferredLanguage = resolvePreferredLanguage();
  const isRootPath = globalThis.location.pathname === "/";

  if (preferredLanguage !== currentLanguage && isRootPath) {
    const targetUrl = resolveTargetUrl(preferredLanguage);

    if (getCurrentPath() !== getTargetPath(targetUrl)) {
      replaceLocation(targetUrl);
    }
  }
})();
