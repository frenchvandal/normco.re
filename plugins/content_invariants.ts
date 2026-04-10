import type Site from "lume/core/site.ts";
import type { Page } from "lume/core/file.ts";

import { parseDateValue } from "../src/utils/date-time.ts";
import {
  isMutableRecord,
  resolveOptionalTrimmedString,
} from "../src/utils/type-guards.ts";

const REQUIRED_POST_LANGUAGES = ["en", "fr", "zh-hans", "zh-hant"] as const;
const LANGUAGE_URL_PREFIX = {
  en: "",
  fr: "/fr",
  "zh-hans": "/zh-hans",
  "zh-hant": "/zh-hant",
} as const;
const POSTS_SOURCE_SEGMENT = "/src/posts/";

function normalizeSourcePath(sourcePath: string): string {
  return sourcePath.replaceAll("\\", "/");
}

function getPostScopeKey(sourcePath: string): string | undefined {
  const normalizedSourcePath = normalizeSourcePath(sourcePath);
  const postsSegmentIndex = normalizedSourcePath.indexOf(POSTS_SOURCE_SEGMENT);

  if (postsSegmentIndex === -1) {
    return undefined;
  }

  const lastSeparatorIndex = normalizedSourcePath.lastIndexOf("/");
  if (lastSeparatorIndex <= postsSegmentIndex + POSTS_SOURCE_SEGMENT.length) {
    return undefined;
  }

  return normalizedSourcePath.slice(0, lastSeparatorIndex);
}

function getPageLabel(page: Page): string {
  if (typeof page.sourcePath === "string" && page.sourcePath.length > 0) {
    return page.sourcePath;
  }

  if (typeof page.data.url === "string" && page.data.url.length > 0) {
    return page.data.url;
  }

  return page.outputPath;
}

function isPostPage(page: Page): boolean {
  return isMutableRecord(page.data) && page.data.type === "post";
}

function formatInvariantError(messages: readonly string[]): string {
  return [
    "Content invariant failures:",
    ...messages.map((message) => `- ${message}`),
  ].join("\n");
}

export function registerContentInvariants(site: Site): void {
  site.preprocess([".md"], (pages: Page[]) => {
    const issues: string[] = [];
    const postPages = pages.filter(isPostPage);
    const seenUrls = new Map<string, string>();
    const postScopes = new Map<string, Page[]>();

    for (const page of postPages) {
      const label = getPageLabel(page);
      const { data } = page;

      const id = resolveOptionalTrimmedString(data.id);
      const title = resolveOptionalTrimmedString(data.title);
      const description = resolveOptionalTrimmedString(data.description);
      const url = resolveOptionalTrimmedString(data.url);
      const lang = resolveOptionalTrimmedString(data.lang);
      const date = parseDateValue(data.date);

      if (id === undefined) {
        issues.push(`${label}: missing non-empty \`id\``);
      }

      if (title === undefined) {
        issues.push(`${label}: missing non-empty \`title\``);
      }

      if (description === undefined) {
        issues.push(`${label}: missing non-empty \`description\``);
      }

      if (url === undefined) {
        issues.push(`${label}: missing non-empty \`url\``);
      }

      if (lang === undefined) {
        issues.push(`${label}: missing non-empty \`lang\``);
      } else if (!(lang in LANGUAGE_URL_PREFIX)) {
        issues.push(
          `${label}: unsupported post language \`${lang}\` (expected ${
            REQUIRED_POST_LANGUAGES.join(", ")
          })`,
        );
      }

      if (date === undefined) {
        issues.push(`${label}: missing parseable \`date\``);
      }

      if (url !== undefined) {
        const expectedPrefix = lang !== undefined && lang in LANGUAGE_URL_PREFIX
          ? LANGUAGE_URL_PREFIX[lang as keyof typeof LANGUAGE_URL_PREFIX]
          : undefined;
        const expectedPostsPrefix = `${expectedPrefix ?? ""}/posts/`;

        if (!url.startsWith(expectedPostsPrefix)) {
          issues.push(
            `${label}: expected post URL to start with \`${expectedPostsPrefix}\`, got \`${url}\``,
          );
        }

        const duplicateUrlSource = seenUrls.get(url);

        if (duplicateUrlSource !== undefined) {
          issues.push(
            `${label}: duplicates URL \`${url}\` already used by ${duplicateUrlSource}`,
          );
        } else {
          seenUrls.set(url, label);
        }
      }

      if (typeof page.sourcePath === "string") {
        const scopeKey = getPostScopeKey(page.sourcePath);

        if (scopeKey !== undefined) {
          postScopes.getOrInsertComputed(scopeKey, () => []).push(page);
        }
      }
    }

    const postIdsByScope = new Map<string, string>();

    for (const [scopeKey, scopedPages] of postScopes.entries()) {
      const scopedIds = new Set<string>();
      const scopedLanguages = new Map<string, string>();

      for (const page of scopedPages) {
        const label = getPageLabel(page);
        const id = resolveOptionalTrimmedString(page.data.id);
        const lang = resolveOptionalTrimmedString(page.data.lang);

        if (id !== undefined) {
          scopedIds.add(id);
        }

        if (lang !== undefined) {
          const duplicateLanguageSource = scopedLanguages.get(lang);

          if (duplicateLanguageSource !== undefined) {
            issues.push(
              `${label}: duplicates locale \`${lang}\` already provided by ${duplicateLanguageSource}`,
            );
          } else {
            scopedLanguages.set(lang, label);
          }
        }
      }

      if (scopedIds.size > 1) {
        issues.push(
          `${scopeKey}: localized siblings disagree on \`id\` values (${
            [...scopedIds].join(", ")
          })`,
        );
      }

      for (const language of REQUIRED_POST_LANGUAGES) {
        if (!scopedLanguages.has(language)) {
          issues.push(
            `${scopeKey}: missing localized Markdown source for \`${language}\``,
          );
        }
      }

      const scopedId = [...scopedIds][0];

      if (scopedId !== undefined) {
        const duplicateScope = postIdsByScope.get(scopedId);

        if (duplicateScope !== undefined && duplicateScope !== scopeKey) {
          issues.push(
            `${scopeKey}: post id \`${scopedId}\` is already used by ${duplicateScope}`,
          );
        } else {
          postIdsByScope.set(scopedId, scopeKey);
        }
      }
    }

    if (issues.length > 0) {
      throw new Error(formatInvariantError(issues));
    }
  });
}
