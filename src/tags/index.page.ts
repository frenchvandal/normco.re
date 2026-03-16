import {
  formatTagPageDescription,
  formatTagPageTitle,
  getLanguageDataCode,
  getLocalizedUrl,
  SUPPORTED_LANGUAGES,
  type SiteLanguage,
} from "../utils/i18n.ts";
import { getTagSlug } from "../utils/tags.ts";

type SearchHelper = {
  pages: (query: string, sort?: string) => Lume.Data[];
};

type TagBucket = {
  readonly tagName: string;
  readonly posts: Lume.Data[];
};

export const layout = "layouts/tag.tsx";
export const renderOrder = 1;

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

function buildAlternates(
  tagSlug: string,
  bucketsByLanguage: ReadonlyMap<SiteLanguage, ReadonlyMap<string, TagBucket>>,
) {
  return SUPPORTED_LANGUAGES.flatMap((language) =>
    bucketsByLanguage.get(language)?.has(tagSlug)
      ? [{
        lang: getLanguageDataCode(language),
        url: getLocalizedUrl(`/tags/${tagSlug}/`, language),
      }]
      : []
  );
}

export default function* (data: Lume.Data): Generator<Lume.Data> {
  const search = data.search as Partial<SearchHelper> | undefined;

  if (typeof search?.pages !== "function") {
    return;
  }

  const bucketsByLanguage = new Map<SiteLanguage, Map<string, TagBucket>>();

  for (const language of SUPPORTED_LANGUAGES) {
    const posts = search.pages(
      `type=post lang=${getLanguageDataCode(language)}`,
      "date=desc",
    ) as Lume.Data[];

    bucketsByLanguage.set(language, collectTagBuckets(posts));
  }

  for (const language of SUPPORTED_LANGUAGES) {
    const localizedBuckets = bucketsByLanguage.get(language) ?? new Map();
    const sortedBuckets = [...localizedBuckets.entries()].sort(([, left], [, right]) =>
      left.tagName.localeCompare(right.tagName)
    );

    for (const [tagSlug, bucket] of sortedBuckets) {
      yield {
        layout,
        url: getLocalizedUrl(`/tags/${tagSlug}/`, language),
        lang: getLanguageDataCode(language),
        title: formatTagPageTitle(bucket.tagName, language),
        description: formatTagPageDescription(
          bucket.tagName,
          bucket.posts.length,
          language,
        ),
        type: "tag",
        tagName: bucket.tagName,
        tagSlug,
        posts: bucket.posts,
        alternates: buildAlternates(tagSlug, bucketsByLanguage),
      } as unknown as Lume.Data;
    }
  }
}
