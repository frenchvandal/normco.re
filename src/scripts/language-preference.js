// @ts-check
(() => {
  const scriptElement = globalThis.document.currentScript;

  if (!(scriptElement instanceof HTMLScriptElement)) {
    return;
  }

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
  ) ?? supportedLanguages[0];

  if (defaultLanguage === undefined) {
    return;
  }

  const currentLanguageCandidate = scriptElement.dataset.currentLanguage ??
    globalThis.document.documentElement.lang;

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

  function navigateToLanguage(language) {
    const targetUrl = resolveTargetUrl(language);

    persistLanguage(language);

    if (getCurrentPath() === getTargetPath(targetUrl)) {
      return;
    }

    globalThis.location.assign(targetUrl);
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
      navigateToLanguage(selectedLanguage);
    });
  }

  function initializeLanguageMenuOptions() {
    const menuOptions = globalThis.document.querySelectorAll(
      "[data-language-option]",
    );

    for (const menuOption of menuOptions) {
      if (
        !(menuOption instanceof HTMLAnchorElement) &&
        !(menuOption instanceof HTMLButtonElement)
      ) {
        continue;
      }

      const selectedLanguage = normalizeLanguage(
        menuOption.dataset.languageOption,
      );

      if (selectedLanguage === null) {
        continue;
      }

      menuOption.addEventListener("click", (event) => {
        persistLanguage(selectedLanguage);

        if (
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        ) {
          return;
        }

        const targetUrl = resolveTargetUrl(selectedLanguage);

        if (menuOption instanceof HTMLAnchorElement) {
          const fallbackPath = getTargetPath(menuOption.href);
          const canonicalPath = getTargetPath(targetUrl);

          if (fallbackPath === canonicalPath) {
            if (getCurrentPath() === canonicalPath) {
              event.preventDefault();
            }
            return;
          }
        }

        event.preventDefault();

        if (getCurrentPath() === getTargetPath(targetUrl)) {
          const languageMenu = menuOption.closest("details");

          if (languageMenu instanceof HTMLDetailsElement) {
            languageMenu.removeAttribute("open");
          }
          return;
        }

        globalThis.location.assign(targetUrl);
      });
    }
  }

  function initializeLanguageControls() {
    initializeLanguageSelector();
    initializeLanguageMenuOptions();
  }

  if (globalThis.document.readyState === "loading") {
    globalThis.document.addEventListener(
      "DOMContentLoaded",
      initializeLanguageControls,
      { once: true },
    );
  } else {
    initializeLanguageControls();
  }
})();
