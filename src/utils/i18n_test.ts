import { assertEquals, assertStrictEquals } from "jsr/assert";
import { describe, it } from "jsr/testing-bdd";

import {
  DEFAULT_LANGUAGE,
  formatPostCount,
  formatReadingTime,
  getLanguageDataCode,
  getLanguagePrefix,
  getLanguageTag,
  getLocalizedUrl,
  getSiteTranslations,
  isSiteLanguage,
  LANGUAGE_DATA_CODE,
  LANGUAGE_PREFIX,
  LANGUAGE_TAG,
  resolveSiteLanguage,
  SUPPORTED_LANGUAGES,
  tryResolveSiteLanguage,
} from "./i18n.ts";

// Seed range: 1101–1199 if Faker is introduced here
// (see CLAUDE.md "TypeScript Tests And Faker")

describe("SUPPORTED_LANGUAGES", () => {
  it("contains exactly four languages in the expected order", () => {
    assertEquals(SUPPORTED_LANGUAGES, ["en", "fr", "zhHans", "zhHant"]);
  });
});

describe("DEFAULT_LANGUAGE", () => {
  it('is "en"', () => {
    assertStrictEquals(DEFAULT_LANGUAGE, "en");
  });
});

describe("isSiteLanguage()", () => {
  it("returns true for all supported language codes", () => {
    for (const language of SUPPORTED_LANGUAGES) {
      assertEquals(
        isSiteLanguage(language),
        true,
        `expected true for "${language}"`,
      );
    }
  });

  it("returns false for unknown string values", () => {
    assertEquals(isSiteLanguage("de"), false);
    assertEquals(isSiteLanguage("zh"), false);
    assertEquals(isSiteLanguage("zh-Hans"), false);
    assertEquals(isSiteLanguage(""), false);
  });

  it("returns false for non-string values", () => {
    assertEquals(isSiteLanguage(null), false);
    assertEquals(isSiteLanguage(undefined), false);
    assertEquals(isSiteLanguage(42), false);
    assertEquals(isSiteLanguage({}), false);
  });
});

describe("tryResolveSiteLanguage()", () => {
  it("resolves direct supported language codes", () => {
    assertStrictEquals(tryResolveSiteLanguage("en"), "en");
    assertStrictEquals(tryResolveSiteLanguage("fr"), "fr");
    assertStrictEquals(tryResolveSiteLanguage("zhHans"), "zhHans");
    assertStrictEquals(tryResolveSiteLanguage("zhHant"), "zhHant");
  });

  it('resolves "zh-hans" alias to "zhHans"', () => {
    assertStrictEquals(tryResolveSiteLanguage("zh-hans"), "zhHans");
  });

  it('resolves "zh_hans" alias to "zhHans"', () => {
    assertStrictEquals(tryResolveSiteLanguage("zh_hans"), "zhHans");
  });

  it('resolves "zh-hant" alias to "zhHant"', () => {
    assertStrictEquals(tryResolveSiteLanguage("zh-hant"), "zhHant");
  });

  it('resolves "zh_hant" alias to "zhHant"', () => {
    assertStrictEquals(tryResolveSiteLanguage("zh_hant"), "zhHant");
  });

  it("returns undefined for unknown codes", () => {
    assertStrictEquals(tryResolveSiteLanguage("de"), undefined);
    assertStrictEquals(tryResolveSiteLanguage("zh"), undefined);
    assertStrictEquals(tryResolveSiteLanguage("jp"), undefined);
    assertStrictEquals(tryResolveSiteLanguage(""), undefined);
  });

  it("returns undefined for non-string values", () => {
    assertStrictEquals(tryResolveSiteLanguage(null), undefined);
    assertStrictEquals(tryResolveSiteLanguage(undefined), undefined);
    assertStrictEquals(tryResolveSiteLanguage(42), undefined);
  });
});

describe("resolveSiteLanguage()", () => {
  it("resolves known language codes", () => {
    assertStrictEquals(resolveSiteLanguage("en"), "en");
    assertStrictEquals(resolveSiteLanguage("fr"), "fr");
    assertStrictEquals(resolveSiteLanguage("zhHans"), "zhHans");
    assertStrictEquals(resolveSiteLanguage("zhHant"), "zhHant");
  });

  it("resolves hyphenated aliases", () => {
    assertStrictEquals(resolveSiteLanguage("zh-hans"), "zhHans");
    assertStrictEquals(resolveSiteLanguage("zh-hant"), "zhHant");
  });

  it(`falls back to "${DEFAULT_LANGUAGE}" for unknown codes`, () => {
    assertStrictEquals(resolveSiteLanguage("de"), DEFAULT_LANGUAGE);
    assertStrictEquals(resolveSiteLanguage(""), DEFAULT_LANGUAGE);
  });

  it(`falls back to "${DEFAULT_LANGUAGE}" for non-string values`, () => {
    assertStrictEquals(resolveSiteLanguage(null), DEFAULT_LANGUAGE);
    assertStrictEquals(resolveSiteLanguage(undefined), DEFAULT_LANGUAGE);
    assertStrictEquals(resolveSiteLanguage(0), DEFAULT_LANGUAGE);
  });
});

describe("getLanguageTag()", () => {
  it("returns BCP 47 tags consistent with LANGUAGE_TAG", () => {
    for (const language of SUPPORTED_LANGUAGES) {
      assertStrictEquals(getLanguageTag(language), LANGUAGE_TAG[language]);
    }
  });

  it("returns the correct tag for each language", () => {
    assertStrictEquals(getLanguageTag("en"), "en");
    assertStrictEquals(getLanguageTag("fr"), "fr");
    assertStrictEquals(getLanguageTag("zhHans"), "zh-Hans");
    assertStrictEquals(getLanguageTag("zhHant"), "zh-Hant");
  });
});

describe("getLanguageDataCode()", () => {
  it("returns codes consistent with LANGUAGE_DATA_CODE", () => {
    for (const language of SUPPORTED_LANGUAGES) {
      assertStrictEquals(
        getLanguageDataCode(language),
        LANGUAGE_DATA_CODE[language],
      );
    }
  });

  it("returns the correct data code for each language", () => {
    assertStrictEquals(getLanguageDataCode("en"), "en");
    assertStrictEquals(getLanguageDataCode("fr"), "fr");
    assertStrictEquals(getLanguageDataCode("zhHans"), "zh-hans");
    assertStrictEquals(getLanguageDataCode("zhHant"), "zh-hant");
  });
});

describe("getLanguagePrefix()", () => {
  it("returns prefixes consistent with LANGUAGE_PREFIX", () => {
    for (const language of SUPPORTED_LANGUAGES) {
      assertStrictEquals(
        getLanguagePrefix(language),
        LANGUAGE_PREFIX[language],
      );
    }
  });

  it('returns an empty string for the default language "en"', () => {
    assertStrictEquals(getLanguagePrefix("en"), "");
  });

  it("returns non-empty prefixes for non-default languages", () => {
    assertStrictEquals(getLanguagePrefix("fr"), "/fr");
    assertStrictEquals(getLanguagePrefix("zhHans"), "/zh-hans");
    assertStrictEquals(getLanguagePrefix("zhHant"), "/zh-hant");
  });
});

describe("getLocalizedUrl()", () => {
  it('returns the path unchanged for the default language "en"', () => {
    assertStrictEquals(getLocalizedUrl("/", "en"), "/");
    assertStrictEquals(getLocalizedUrl("/posts/", "en"), "/posts/");
    assertStrictEquals(getLocalizedUrl("/about/", "en"), "/about/");
  });

  it('localizes the root "/" for non-default languages', () => {
    assertStrictEquals(getLocalizedUrl("/", "fr"), "/fr/");
    assertStrictEquals(getLocalizedUrl("/", "zhHans"), "/zh-hans/");
    assertStrictEquals(getLocalizedUrl("/", "zhHant"), "/zh-hant/");
  });

  it("prepends the language prefix to non-root paths", () => {
    assertStrictEquals(getLocalizedUrl("/posts/", "fr"), "/fr/posts/");
    assertStrictEquals(getLocalizedUrl("/about/", "zhHans"), "/zh-hans/about/");
    assertStrictEquals(
      getLocalizedUrl("/feed.xml", "zhHant"),
      "/zh-hant/feed.xml",
    );
  });

  it("normalizes paths that lack a leading slash", () => {
    assertStrictEquals(getLocalizedUrl("posts/", "fr"), "/fr/posts/");
    assertStrictEquals(getLocalizedUrl("about/", "en"), "/about/");
  });
});

describe("getSiteTranslations()", () => {
  it("keeps language selector labels invariant across locales", () => {
    const expectedLanguageNames = {
      en: "English",
      fr: "Français",
      zhHans: "简体中文",
      zhHant: "繁體中文",
    };

    for (const language of SUPPORTED_LANGUAGES) {
      assertEquals(
        getSiteTranslations(language).languageNames,
        expectedLanguageNames,
      );
    }
  });
});

describe("formatReadingTime()", () => {
  it("formats a single minute correctly for each language", () => {
    assertStrictEquals(formatReadingTime(1, "en"), "1 min read");
    assertStrictEquals(formatReadingTime(1, "fr"), "1\u00a0min de lecture");
    assertStrictEquals(formatReadingTime(1, "zhHans"), "1 分钟阅读");
    assertStrictEquals(formatReadingTime(1, "zhHant"), "1 分鐘閱讀");
  });

  it("formats multiple minutes correctly for each language", () => {
    assertStrictEquals(formatReadingTime(5, "en"), "5 min read");
    assertStrictEquals(formatReadingTime(10, "fr"), "10\u00a0min de lecture");
    assertStrictEquals(formatReadingTime(3, "zhHans"), "3 分钟阅读");
    assertStrictEquals(formatReadingTime(7, "zhHant"), "7 分鐘閱讀");
  });
});

describe("formatPostCount()", () => {
  it("uses the singular form for 1 post in English", () => {
    assertStrictEquals(formatPostCount(1, "en"), "1 post published");
  });

  it("uses the plural form for 0 and multiple posts in English", () => {
    assertStrictEquals(formatPostCount(0, "en"), "0 posts published");
    assertStrictEquals(formatPostCount(5, "en"), "5 posts published");
  });

  it("uses the singular form for 1 post in French", () => {
    assertStrictEquals(formatPostCount(1, "fr"), "1 article publié");
  });

  it("uses the plural form for 0 and multiple posts in French", () => {
    assertStrictEquals(formatPostCount(0, "fr"), "0 articles publiés");
    assertStrictEquals(formatPostCount(3, "fr"), "3 articles publiés");
  });

  it("formats post count in Simplified Chinese", () => {
    assertStrictEquals(formatPostCount(4, "zhHans"), "4 篇文章");
    assertStrictEquals(formatPostCount(1, "zhHans"), "1 篇文章");
  });

  it("formats post count in Traditional Chinese", () => {
    assertStrictEquals(formatPostCount(2, "zhHant"), "2 篇文章");
  });
});
