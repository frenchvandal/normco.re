import type { jsx } from "lume/jsx-runtime";

import SiteIcon from "../../_components/SiteIcon.tsx";
import {
  resolvePostCreatedDate,
  resolvePostGitLastCommit,
  resolvePostUpdatedDate,
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
  const postDate = resolvePostCreatedDate(data);
  const updatedDate = resolvePostUpdatedDate(data, postDate);
  const lastCommit = resolvePostGitLastCommit(
    typeof data.git === "object" && data.git !== null
      ? Reflect.get(data.git, "lastCommit")
      : undefined,
  );
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
  const updatedDateIso = dateFormat(updatedDate, "ATOM", language) ??
    formatRfc3339Instant(updatedDate);
  const updatedDateLabel = dateFormat(updatedDate, "HUMAN_DATE", language) ??
    formatRfc3339Instant(updatedDate);
  const showUpdatedDate = updatedDate.getTime() !== postDate.getTime();
  const readingTimeLabel = minutes !== undefined
    ? formatReadingTime(minutes, language)
    : undefined;
  const visibleSummary = resolveOptionalTrimmedString(data.description);

  const summaryItems = [
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
    showUpdatedDate
      ? {
        key: "updated",
        term: t.lastUpdatedLabel,
        value: <time datetime={updatedDateIso}>{updatedDateLabel}</time>,
      }
      : undefined,
    lastCommit
      ? {
        key: "commit",
        term: t.commitLabel,
        value: lastCommit.url
          ? (
            <a
              href={lastCommit.url}
              class="post-details-link"
              title={lastCommit.sha}
            >
              {lastCommit.shortSha}
            </a>
          )
          : <span title={lastCommit.sha}>{lastCommit.shortSha}</span>,
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
      <details class="site-details post-details-disclosure">
        <summary class="site-details__summary">
          <SiteIcon
            name="chevron-down"
            className="site-details__arrow"
            width={16}
            height={16}
          />
          <span class="site-details__title">{title}</span>
        </summary>
        <div class="site-details__content">
          {renderDefinitionList(items, detailsMetaClasses)}
        </div>
      </details>
    </footer>
  );
}

function PostOutlineList(
  {
    outline,
    listClassName = "post-outline-list",
    linkClassName = "post-outline-link",
  }: {
    outline: readonly PostOutlineItem[];
    listClassName?: string;
    linkClassName?: string;
  },
): El {
  return (
    <ul class={listClassName}>
      {outline.map((item) => (
        <li
          key={item.id}
          class={`post-outline-item post-outline-item--level-${item.level}`}
        >
          <a href={`#${item.id}`} class={linkClassName}>
            {item.text}
          </a>
        </li>
      ))}
    </ul>
  );
}

export function PostInlineAnchor(
  {
    outline,
    title,
    ariaLabel,
  }: {
    outline: readonly PostOutlineItem[];
    title: string;
    ariaLabel: string;
  },
): El | null {
  if (outline.length === 0) {
    return null;
  }

  return (
    <section
      class="post-inline-anchor"
      aria-labelledby="post-inline-anchor-title"
    >
      <div class="post-inline-anchor__head">
        <p id="post-inline-anchor-title" class="post-inline-anchor__title">
          {title}
        </p>
      </div>
      <nav
        class="post-outline-nav post-outline-nav--inline"
        aria-label={ariaLabel}
      >
        <PostOutlineList
          outline={outline}
          listClassName="post-outline-list post-outline-list--anchor"
          linkClassName="post-outline-link post-outline-link--anchor"
        />
      </nav>
    </section>
  );
}

export function PostBackToTop(
  { label }: { label: string },
): El {
  return (
    <a
      href="#post-title"
      class="post-backtop"
      aria-label={label}
    >
      <span class="blog-antd-backtop__button post-backtop__button">
        <SiteIcon
          name="arrow-right"
          className="post-backtop__icon"
          width={16}
          height={16}
        />
        <span class="sr-only">{label}</span>
      </span>
    </a>
  );
}

export function PostRail(
  {
    language,
    translations,
    closeLabel,
    outline,
    backlinks,
    tags,
    prev,
    next,
  }: {
    language: SiteLanguage;
    translations: PostTranslations;
    closeLabel: string;
    outline: readonly PostOutlineItem[];
    backlinks: readonly PostLinkReference[];
    tags: readonly string[];
    prev: Lume.Data | undefined;
    next: Lume.Data | undefined;
  },
): El {
  const outlineSection = outline.length > 0
    ? {
      key: "outline",
      className: "post-outline-card",
      countLabel: String(outline.length).padStart(2, "0"),
      title: translations.outlineTitle,
      body: (
        <nav
          class="post-outline-nav post-outline-nav--rail"
          aria-label={translations.outlineAriaLabel}
        >
          <PostOutlineList outline={outline} />
        </nav>
      ),
    }
    : undefined;

  const supportingSections = [
    tags.length > 0
      ? {
        key: "tags",
        className: "post-tags-card",
        countLabel: String(tags.length).padStart(2, "0"),
        title: translations.tagsAriaLabel,
        body: (
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
        ),
      }
      : undefined,
    backlinks.length > 0
      ? {
        key: "backlinks",
        className: "post-backlinks-card",
        countLabel: String(backlinks.length).padStart(2, "0"),
        title: translations.backlinksTitle,
        body: (
          <ul class="post-backlinks-list">
            {backlinks.map((reference) => (
              <li key={reference.url}>
                <a href={reference.url} class="post-backlinks-link">
                  {reference.title}
                </a>
              </li>
            ))}
          </ul>
        ),
      }
      : undefined,
    (prev || next)
      ? {
        key: "navigation",
        className: "post-nav-card",
        countLabel: String([prev, next].filter(Boolean).length).padStart(
          2,
          "0",
        ),
        title: translations.navigationAriaLabel,
        body: (
          <nav
            class="post-nav post-nav--rail"
            aria-label={translations.navigationAriaLabel}
          >
            <PostNavLink post={prev} label={translations.previousLabel} />
            <PostNavLink
              post={next}
              label={translations.nextLabel}
              isNext
            />
          </nav>
        ),
      }
      : undefined,
  ].filter(isDefined);

  const desktopSections = [
    outlineSection,
    ...supportingSections,
  ].filter(isDefined);
  const mobileSections = supportingSections;
  const railClassName = `feature-rail post-rail${
    mobileSections.length === 0 ? " post-rail--outline-only" : ""
  }`;

  return (
    <>
      {mobileSections.length > 0 && (
        <section
          class="post-mobile-tools"
          aria-label={translations.railAriaLabel}
        >
          <button
            type="button"
            class="post-mobile-tools-trigger"
            aria-controls="post-mobile-tools-dialog"
            aria-expanded="false"
            aria-label={translations.railTriggerLabel}
            data-post-mobile-tools-open=""
          >
            <span class="post-mobile-tools-trigger__icon" aria-hidden="true">
              <SiteIcon
                name="list-unordered"
                className="post-mobile-tools-trigger__icon-svg"
                width={18}
                height={18}
              />
            </span>
            <span class="post-mobile-tools-trigger__body">
              <span class="post-mobile-tools-trigger__eyebrow">
                {translations.railTriggerLabel}
              </span>
              <span class="post-mobile-tools-trigger__hint">
                {translations.railTriggerHint}
              </span>
            </span>
            <span class="post-mobile-tools-trigger__count" aria-hidden="true">
              {String(mobileSections.length).padStart(2, "0")}
            </span>
          </button>
          <dialog
            id="post-mobile-tools-dialog"
            class="post-mobile-tools-dialog"
            aria-labelledby="post-mobile-tools-title"
            aria-describedby="post-mobile-tools-description"
            data-post-mobile-tools=""
          >
            <div class="post-mobile-tools-sheet">
              <span class="post-mobile-tools-handle" aria-hidden="true"></span>
              <div class="post-mobile-tools-head">
                <div class="post-mobile-tools-head-copy">
                  <p
                    id="post-mobile-tools-title"
                    class="post-mobile-tools-title"
                  >
                    {translations.railTriggerLabel}
                  </p>
                  <p
                    id="post-mobile-tools-description"
                    class="post-mobile-tools-description"
                  >
                    {translations.railDescription}
                  </p>
                </div>
                <button
                  type="button"
                  class="btn post-mobile-tools-close"
                  aria-label={closeLabel}
                  data-post-mobile-tools-close=""
                >
                  <SiteIcon
                    name="x"
                    className="post-mobile-tools-close__icon"
                    width={18}
                    height={18}
                  />
                </button>
              </div>
              <div class="post-mobile-tools-sections">
                {mobileSections.map((section, index) => (
                  <details
                    key={section.key}
                    class={`post-mobile-tools-section ${section.className}`}
                    {...(index === 0 ? { open: true } : {})}
                  >
                    <summary class="post-mobile-tools-section__summary">
                      <span class="post-mobile-tools-section__title">
                        {section.title}
                      </span>
                      <span
                        class="post-mobile-tools-section__count"
                        aria-hidden="true"
                      >
                        {section.countLabel}
                      </span>
                    </summary>
                    <div class="post-mobile-tools-section__body">
                      {section.body}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </dialog>
        </section>
      )}

      <aside class={railClassName} aria-label={translations.railAriaLabel}>
        <div class="feature-rail-sticky">
          {desktopSections.map((section) => (
            <section
              key={section.key}
              class={`feature-card post-rail-card ${section.className}`}
            >
              <h2 class="feature-card-title">{section.title}</h2>
              {section.body}
            </section>
          ))}
        </div>
      </aside>
    </>
  );
}

export function PostSummaryMeta(
  { items }: { items: readonly DlItem[] },
): El {
  return renderDefinitionList(items, summaryMetaClasses);
}
