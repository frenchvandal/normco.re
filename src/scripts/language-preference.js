(() => {
  const scriptElement = globalThis.document.currentScript;

  if (!(scriptElement instanceof HTMLScriptElement)) {
    return;
  }

  const STORAGE_KEY = "preferred-language";
  const rawSupportedLanguages = scriptElement.dataset.supportedLanguages ??
    "en,fr";
  const supportedLanguages = rawSupportedLanguages
    .split(",")
    .map((language) => language.trim().toLowerCase())
    .filter((language) => language.length > 0);

  if (supportedLanguages.length === 0) {
    return;
  }

  const defaultLanguageCandidate =
    scriptElement.dataset.defaultLanguage?.toLowerCase() ?? "en";
  const defaultLanguage = supportedLanguages.includes(defaultLanguageCandidate)
    ? defaultLanguageCandidate
    : supportedLanguages[0];

  if (defaultLanguage === undefined) {
    return;
  }

  const currentLanguageCandidate = scriptElement.dataset.currentLanguage ??
    globalThis.document.documentElement.lang;

  function normalizeLanguage(value) {
    if (typeof value !== "string") {
      return null;
    }

    const [language] = value.trim().toLowerCase().split(/[-_]/u);

    if (language === undefined || !supportedLanguages.includes(language)) {
      return null;
    }

    return language;
  }

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

      const alternates = {};

      for (const [language, path] of Object.entries(parsed)) {
        if (
          supportedLanguages.includes(language) &&
          typeof path === "string" &&
          path.length > 0
        ) {
          alternates[language] = path;
        }
      }

      return alternates;
    } catch {
      return {};
    }
  }

  const alternateUrls = parseAlternateUrls();

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

  function readStoredLanguage() {
    try {
      const storedLanguage = globalThis.localStorage.getItem(STORAGE_KEY);
      return normalizeLanguage(storedLanguage);
    } catch {
      return null;
    }
  }

  function persistLanguage(language) {
    try {
      globalThis.localStorage.setItem(STORAGE_KEY, language);
    } catch {
      // Ignore storage failures (private mode, blocked storage, etc.).
    }
  }

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

  function resolvePreferredLanguage() {
    const storedLanguage = readStoredLanguage();

    if (storedLanguage !== null) {
      return storedLanguage;
    }

    const localeLanguage = resolveLocaleLanguage();

    if (localeLanguage !== null) {
      return localeLanguage;
    }

    return defaultLanguage;
  }

  function getCurrentPath() {
    return `${globalThis.location.pathname}${globalThis.location.search}`;
  }

  function getTargetPath(targetUrl) {
    const absoluteTarget = new URL(targetUrl, globalThis.location.origin);
    return `${absoluteTarget.pathname}${absoluteTarget.search}`;
  }

  const currentLanguage = normalizeLanguage(currentLanguageCandidate) ??
    defaultLanguage;
  const preferredLanguage = resolvePreferredLanguage();

  if (preferredLanguage !== currentLanguage) {
    const targetUrl = resolveTargetUrl(preferredLanguage);

    if (getCurrentPath() !== getTargetPath(targetUrl)) {
      globalThis.location.replace(targetUrl);
      return;
    }
  }

  function initializeLanguageSelector() {
    const selector = globalThis.document.getElementById("language-select");

    if (!(selector instanceof HTMLSelectElement)) {
      return;
    }

    selector.value = currentLanguage;

    selector.addEventListener("change", () => {
      const selectedLanguage = normalizeLanguage(selector.value) ??
        defaultLanguage;
      const targetUrl = resolveTargetUrl(selectedLanguage);

      persistLanguage(selectedLanguage);

      if (getCurrentPath() === getTargetPath(targetUrl)) {
        return;
      }

      globalThis.location.assign(targetUrl);
    });
  }

  if (globalThis.document.readyState === "loading") {
    globalThis.document.addEventListener(
      "DOMContentLoaded",
      initializeLanguageSelector,
      { once: true },
    );
  } else {
    initializeLanguageSelector();
  }
})();
