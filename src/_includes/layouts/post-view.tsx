import type { jsx } from "lume/jsx-runtime";

import SiteIcon from "../../_components/SiteIcon.tsx";
import {
  resolvePostDate,
  resolveReadingMinutes,
} from "../../posts/post-metadata.ts";
import { formatRfc3339Instant } from "../../utils/date-time.ts";
import { formatReadingTime } from "../../utils/i18n.ts";
import {
  callMethod,
  resolveHtmlChildren,
  resolveStringTags,
} from "../../utils/lume-data.ts";
import type { SiteLanguage, SiteTranslations } from "../../utils/i18n.ts";
import type { DateHelper } from "../../utils/lume-helpers.ts";
import {
  enhancePostContent,
  type PostOutlineItem,
} from "../../utils/post-outline.ts";
import { getTagColor, getTagUrl } from "../../utils/tags.ts";
import {
  isDefined,
  isLumeData,
  resolveOptionalTrimmedString,
} from "../../utils/type-guards.ts";
import type { PostLinkReference } from "../../../plugins/post_link_graph.ts";

type El = ReturnType<typeof jsx>;
type DlItem = Readonly<
  { key: string; term: string; value: El | string | number }
>;
type PostNeighbors = Readonly<{
  prev: Lume.Data | undefined;
  next: Lume.Data | undefined;
}>;
type PostTranslations = SiteTranslations["post"];
type PostLocale = Readonly<{ language: SiteLanguage; post: PostTranslations }>;

const summaryMetaClasses = {
  list: "post-summary-meta",
  item: "post-summary-meta-group",
  term: "post-summary-term",
  value: "post-summary-value",
} as const;

const detailsMetaClasses = {
  list: "post-details-list",
  item: "post-details-item",
  term: "post-details-term",
  value: "post-details-value",
} as const;

export type PostState = Readonly<{
  backlinks: readonly PostLinkReference[];
  includeCodeCopy: boolean;
  hasRail: boolean;
  outline: readonly PostOutlineItem[];
  publishedDateIso: string;
  publishedDateLabel: string;
  publicationDetails: readonly DlItem[];
  readingTimeLabel?: string;
  renderedChildren: Lume.Data["children"];
  showSummaryBlock: boolean;
  summaryItems: readonly DlItem[];
  tags: readonly string[];
  visibleSummary?: string;
}>;

function renderDefinitionList(
  items: readonly DlItem[],
  cls: Readonly<Record<"list" | "item" | "term" | "value", string>>,
): El {
  return (
    <dl class={cls.list}>
      {items.map(({ key, term, value }) => (
        <div key={key} class={cls.item}>
          <dt class={cls.term}>{term}</dt>
          <dd class={cls.value}>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function PostNavLink(
  { post, label, isNext }: {
    post: Lume.Data | undefined;
    label: string;
    isNext?: boolean;
  },
): El {
  if (!post) return <div class="post-nav-placeholder" aria-hidden="true"></div>;
  return (
    <div class={`post-nav-item${isNext ? " post-nav-item--next" : ""}`}>
      <span class="post-nav-label">{label}</span>
      <a href={post.url ?? ""} class="post-nav-title">{post.title ?? ""}</a>
    </div>
  );
}

function isPostCandidate(
  value: unknown,
  postsBaseUrl: string,
): value is Lume.Data {
  return isLumeData(value) && typeof value.url === "string" &&
    value.url.startsWith(postsBaseUrl) && value.url !== postsBaseUrl &&
    (value.type === undefined || value.type === "post");
}

function resolvePostLinkReferences(
  value: unknown,
): readonly PostLinkReference[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const references: PostLinkReference[] = [];
  const seenUrls = new Set<string>();

  for (const reference of value) {
    if (typeof reference !== "object" || reference === null) {
      continue;
    }

    const url = resolveOptionalTrimmedString(Reflect.get(reference, "url"));
    const title = resolveOptionalTrimmedString(Reflect.get(reference, "title"));

    if (url === undefined || title === undefined || seenUrls.has(url)) {
      continue;
    }

    seenUrls.add(url);
    references.push({ title, url });
  }

  return references;
}

export function resolvePostNeighbors(
  data: Lume.Data,
  currentUrl: string,
  postsBaseUrl: string,
  postQuery: string,
): PostNeighbors {
  const posts =
    (callMethod<unknown[]>(data.search, "pages", postQuery, "date=asc") ?? [])
      .filter(isLumeData);
  const idx = posts.findIndex((post) => post.url === currentUrl);
  let prev = idx > 0 ? posts[idx - 1] : undefined;
  let next = idx >= 0 && idx < posts.length - 1 ? posts[idx + 1] : undefined;

  if (!prev) {
    const candidate = callMethod(
      data.nav,
      "previousPage",
      currentUrl,
      postsBaseUrl,
      postQuery,
      "date=asc",
    );
    if (isPostCandidate(candidate, postsBaseUrl)) prev = candidate;
  }

  if (!next) {
    const candidate = callMethod(
      data.nav,
      "nextPage",
      currentUrl,
      postsBaseUrl,
      postQuery,
      "date=asc",
    );
    if (isPostCandidate(candidate, postsBaseUrl)) next = candidate;
  }

  return { prev, next };
}

export function resolvePostState(
  data: Lume.Data,
  dateFormat: DateHelper,
  { language, post: t }: PostLocale,
  neighbors: PostNeighbors,
): PostState {
  const currentUrl = typeof data.url === "string" ? data.url : "/";
  const postDate = resolvePostDate(data.date);
  const minutes = resolveReadingMinutes(data.readingInfo);
  const tags = resolveStringTags(data.tags);
  const backlinks = resolvePostLinkReferences(data.backlinks);
  const rawHtml = resolveHtmlChildren(data.children);
  const includeCodeCopy = /<pre>\s*<code\b/i.test(rawHtml ?? "");
  const { html, outline } = rawHtml
    ? enhancePostContent(rawHtml)
    : { html: "", outline: [] };
  const renderedChildren = rawHtml ? { __html: html } : data.children;
  const publishedDateIso = dateFormat(postDate, "ATOM", language) ??
    formatRfc3339Instant(postDate);
  const publishedDateLabel = dateFormat(postDate, "HUMAN_DATE", language) ??
    formatRfc3339Instant(postDate);
  const readingTimeLabel = minutes !== undefined
    ? formatReadingTime(minutes, language)
    : undefined;
  const visibleSummary = resolveOptionalTrimmedString(data.description);

  const summaryItems = [
    readingTimeLabel
      ? {
        key: "reading-time",
        term: t.readingLabel,
        value: readingTimeLabel,
      }
      : undefined,
    outline.length > 0
      ? { key: "sections", term: t.sectionsLabel, value: outline.length }
      : undefined,
  ].filter(isDefined);

  const publicationDetails: DlItem[] = [
    {
      key: "published",
      term: t.publishedLabel,
      value: <time datetime={publishedDateIso}>{publishedDateLabel}</time>,
    },
    readingTimeLabel
      ? {
        key: "reading-time",
        term: t.readingLabel,
        value: readingTimeLabel,
      }
      : undefined,
    {
      key: "permalink",
      term: t.permalinkLabel,
      value: <a href={currentUrl} class="post-details-link">{currentUrl}</a>,
    },
  ].filter(isDefined);

  return {
    backlinks,
    includeCodeCopy,
    hasRail: outline.length > 0 || tags.length > 0 || backlinks.length > 0 ||
      neighbors.prev !== undefined || neighbors.next !== undefined,
    outline,
    publishedDateIso,
    publishedDateLabel,
    publicationDetails,
    ...(readingTimeLabel !== undefined ? { readingTimeLabel } : {}),
    renderedChildren,
    showSummaryBlock: visibleSummary !== undefined || outline.length > 0,
    summaryItems,
    tags,
    ...(visibleSummary !== undefined ? { visibleSummary } : {}),
  };
}

export function PostDetails(
  { title, items }: { title: string; items: readonly DlItem[] },
): El {
  return (
    <footer class="post-details-section">
      <ul
        class="site-accordion post-details-accordion"
        data-site-accordion=""
      >
        <li class="site-accordion__item">
          <button
            type="button"
            class="site-accordion__heading"
            data-accordion-trigger=""
            aria-expanded="false"
            aria-controls="post-publication-details"
          >
            <SiteIcon
              name="chevron-down"
              className="site-accordion__arrow"
              width={16}
              height={16}
            />
            <span class="site-accordion__title">{title}</span>
          </button>
          <div
            id="post-publication-details"
            class="site-accordion__wrapper"
            data-accordion-panel=""
            hidden
          >
            <div class="site-accordion__content">
              {renderDefinitionList(items, detailsMetaClasses)}
            </div>
          </div>
        </li>
      </ul>
    </footer>
  );
}

export function PostRail(
  {
    language,
    translations,
    outline,
    backlinks,
    tags,
    prev,
    next,
  }: {
    language: SiteLanguage;
    translations: PostTranslations;
    outline: readonly PostOutlineItem[];
    backlinks: readonly PostLinkReference[];
    tags: readonly string[];
    prev: Lume.Data | undefined;
    next: Lume.Data | undefined;
  },
): El {
  return (
    <aside
      class="feature-rail post-rail"
      aria-label={translations.railAriaLabel}
    >
      <div class="feature-rail-sticky">
        {outline.length > 0 && (
          <section class="feature-card post-rail-card post-outline-card">
            <h2 class="feature-card-title">{translations.outlineTitle}</h2>
            <nav
              class="post-outline-nav"
              aria-label={translations.outlineAriaLabel}
            >
              <ul class="post-outline-list">
                {outline.map((item) => (
                  <li
                    key={item.id}
                    class={`post-outline-item post-outline-item--level-${item.level}`}
                  >
                    <a href={`#${item.id}`} class="post-outline-link">
                      {item.text}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </section>
        )}

        {tags.length > 0 && (
          <section class="feature-card post-rail-card post-tags-card">
            <h2 class="feature-card-title">{translations.tagsAriaLabel}</h2>
            <ul class="post-tags post-tags--rail">
              {tags.map((tag, i) => (
                <li key={`${tag}-${i}`}>
                  <a
                    href={getTagUrl(tag, language)}
                    class={`tag-link tag-link--${getTagColor(tag)}`}
                    rel="tag"
                    title={tag}
                  >
                    <span class="tag-link__label">{tag}</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        {backlinks.length > 0 && (
          <section class="feature-card post-rail-card post-backlinks-card">
            <h2 class="feature-card-title">{translations.backlinksTitle}</h2>
            <ul class="post-backlinks-list">
              {backlinks.map((reference) => (
                <li key={reference.url}>
                  <a href={reference.url} class="post-backlinks-link">
                    {reference.title}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        {(prev || next) && (
          <section class="feature-card post-rail-card post-nav-card">
            <h2 class="feature-card-title">
              {translations.navigationAriaLabel}
            </h2>
            <nav
              class="post-nav post-nav--rail"
              aria-label={translations.navigationAriaLabel}
            >
              <PostNavLink post={prev} label={translations.previousLabel} />
              <PostNavLink post={next} label={translations.nextLabel} isNext />
            </nav>
          </section>
        )}
      </div>
    </aside>
  );
}

export function PostSummaryMeta(
  { items }: { items: readonly DlItem[] },
): El {
  return renderDefinitionList(items, summaryMetaClasses);
}
