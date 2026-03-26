import {
  DEFAULT_LANGUAGE,
  formatTagPageDescription,
  formatTagPageTitle,
  getLanguageDataCode,
  type SiteLanguage,
  SUPPORTED_LANGUAGES,
} from "../utils/i18n.ts";
import { searchPages } from "../utils/lume-data.ts";
import { getTagSlug } from "../utils/tags.ts";

type TagBucket = {
  readonly tagName: string;
  readonly posts: Lume.Data[];
};

export const layout = "layouts/tag.tsx";
export const renderOrder = 1;

type TagPageVariant = Readonly<{
  description: string;
  posts: Lume.Data[];
  tagName: string;
  title: string;
}>;

function collectTagBuckets(posts: Lume.Data[]): Map<string, TagBucket> {
  const buckets = new Map<string, { tagName: string; posts: Lume.Data[] }>();

  for (const post of posts) {
    const tags = Array.isArray(post.tags) ? post.tags : [];

    for (const rawTag of tags) {
      if (typeof rawTag !== "string" || rawTag.trim().length === 0) {
        continue;
      }

      const tagName = rawTag.trim();
      const tagSlug = getTagSlug(tagName);
      const bucket = buckets.get(tagSlug) ?? { tagName, posts: [] };
      bucket.posts.push(post);
      buckets.set(tagSlug, bucket);
    }
  }

  return buckets;
}

function getAvailableLanguages(
  tagSlug: string,
  bucketsByLanguage: ReadonlyMap<SiteLanguage, ReadonlyMap<string, TagBucket>>,
): SiteLanguage[] {
  return SUPPORTED_LANGUAGES.filter((language) =>
    bucketsByLanguage.get(language)?.has(tagSlug)
  );
}

function resolveBaseLanguage(availableLanguages: readonly SiteLanguage[]) {
  if (availableLanguages.length === 0) {
    return undefined;
  }

  return availableLanguages.includes(DEFAULT_LANGUAGE)
    ? DEFAULT_LANGUAGE
    : availableLanguages[0];
}

function buildTagPageVariant(
  bucket: TagBucket,
  language: SiteLanguage,
): TagPageVariant {
  return {
    description: formatTagPageDescription(
      bucket.tagName,
      bucket.posts.length,
      language,
    ),
    posts: bucket.posts,
    tagName: bucket.tagName,
    title: formatTagPageTitle(bucket.tagName, language),
  };
}

function getTagSortLabel(
  tagSlug: string,
  bucketsByLanguage: ReadonlyMap<SiteLanguage, ReadonlyMap<string, TagBucket>>,
): string {
  const availableLanguages = getAvailableLanguages(tagSlug, bucketsByLanguage);
  const baseLanguage = resolveBaseLanguage(availableLanguages);
  if (baseLanguage === undefined) {
    return tagSlug;
  }

  return bucketsByLanguage.get(baseLanguage)?.get(tagSlug)?.tagName ?? tagSlug;
}

export default function* (data: Lume.Data): Generator<Lume.Data> {
  const bucketsByLanguage = new Map<SiteLanguage, Map<string, TagBucket>>();
  const tagSlugs = new Set<string>();

  for (const language of SUPPORTED_LANGUAGES) {
    const posts = searchPages(
      data.search,
      `type=post lang=${getLanguageDataCode(language)}`,
      "date=desc",
    );

    const buckets = collectTagBuckets(posts);
    bucketsByLanguage.set(language, buckets);

    for (const tagSlug of buckets.keys()) {
      tagSlugs.add(tagSlug);
    }
  }

  const sortedTagSlugs = [...tagSlugs].sort((left, right) =>
    getTagSortLabel(left, bucketsByLanguage).localeCompare(
      getTagSortLabel(right, bucketsByLanguage),
    )
  );

  for (const tagSlug of sortedTagSlugs) {
    const availableLanguages = getAvailableLanguages(
      tagSlug,
      bucketsByLanguage,
    );
    const baseLanguage = resolveBaseLanguage(availableLanguages);

    if (baseLanguage === undefined) {
      continue;
    }

    const baseBucket = bucketsByLanguage.get(baseLanguage)?.get(tagSlug);

    if (baseBucket === undefined) {
      continue;
    }

    const pageData: Record<string, unknown> = {
      layout,
      id: `tag:${tagSlug}`,
      url: `/tags/${tagSlug}/`,
      lang: availableLanguages.map((language) => getLanguageDataCode(language)),
      searchIndexed: false,
      type: "tag",
      tagSlug,
      ...buildTagPageVariant(baseBucket, baseLanguage),
    };

    for (const language of availableLanguages) {
      if (language === baseLanguage) {
        continue;
      }

      const bucket = bucketsByLanguage.get(language)?.get(tagSlug);

      if (bucket !== undefined) {
        pageData[getLanguageDataCode(language)] = buildTagPageVariant(
          bucket,
          language,
        );
      }
    }

    yield pageData as Lume.Data;
  }
}
