import {
  type ArchiveMonthGroup,
  buildArchiveTimelineEntries,
  formatArchiveIndex,
  groupArchiveYears,
} from "./archive-common.ts";
import type { SiteLanguage } from "../utils/i18n.ts";
import { escapeHtml } from "../utils/html.ts";
import { getTagUrl } from "../utils/tags.ts";
import type { BlogStoryCard } from "./view-data.ts";
export { formatArchiveIndex, groupArchiveMonths } from "./archive-common.ts";

function renderMeta(story: BlogStoryCard): string {
  const items = [
    `<span class="blog-antd-meta-pill"><time datetime="${
      escapeHtml(story.dateIso)
    }">${escapeHtml(story.dateLabel)}</time></span>`,
  ];

  if (story.readingLabel) {
    items.push(
      `<span class="blog-antd-meta-pill">${
        escapeHtml(story.readingLabel)
      }</span>`,
    );
  }

  return `<div class="blog-antd-archive-timeline__meta">${
    items.join("")
  }</div>`;
}

function renderStoryTags(
  story: BlogStoryCard,
  language: SiteLanguage,
): string {
  const visibleTags = story.tags?.slice(0, 3) ?? [];

  if (visibleTags.length === 0) {
    return "";
  }

  const tags = visibleTags.map((tag) =>
    `<a href="${
      escapeHtml(getTagUrl(tag, language))
    }" class="tag-link" rel="tag">
  <span class="tag-link__label">${escapeHtml(tag)}</span>
</a>`
  ).join("");

  return `<div class="post-tags blog-antd-story-tags">${tags}</div>`;
}

export function renderArchiveMonthNav(
  months: readonly ArchiveMonthGroup[],
  label: string,
): string {
  const newestMonth = months[0];
  const oldestMonth = months[months.length - 1];

  if (!newestMonth || !oldestMonth) {
    return "";
  }

  const groups = groupArchiveYears(months).map(
    ({ year, months: yearMonths }) => {
      const items = yearMonths.map((month) =>
        `<li class="blog-antd-archive-anchor-item">
  <a
    class="blog-antd-archive-anchor-link"
    href="#${escapeHtml(month.anchorId)}"
    title="${escapeHtml(month.label)} • ${
          formatArchiveIndex(month.posts.length)
        }"
  >
    <span class="blog-antd-archive-anchor__title">
      <span class="blog-antd-archive-anchor__label">${
          escapeHtml(month.shortLabel)
        }</span>
      <span class="blog-antd-archive-anchor__count">${
          formatArchiveIndex(month.posts.length)
        }</span>
    </span>
  </a>
</li>`
      ).join("");

      return `<section
  class="blog-antd-archive-month-group"
  aria-labelledby="archive-year-${year}"
>
  <p
    id="archive-year-${year}"
    class="blog-antd-archive-month-group__year"
  >
    ${year}
  </p>
  <ul class="blog-antd-archive-anchor-list">
    ${items}
  </ul>
</section>`;
    },
  ).join("");

  return `<aside class="blog-antd-archive-nav" aria-label="${
    escapeHtml(label)
  }">
  <div class="blog-antd-archive-nav__intro">
    <p class="blog-antd-eyebrow">${escapeHtml(label)}</p>
    <p class="blog-antd-archive-nav__range">
      ${escapeHtml(oldestMonth.label)} - ${escapeHtml(newestMonth.label)}
    </p>
  </div>
  <div class="blog-antd-archive-month-groups">
    ${groups}
  </div>
</aside>`;
}

export function renderArchiveTimeline(
  months: readonly ArchiveMonthGroup[],
  ariaLabel: string,
  language: SiteLanguage,
): string {
  const items = buildArchiveTimelineEntries(months).map((entry) => {
    const { index, isLead, month, story } = entry;

    return `<li class="blog-antd-archive-timeline__entry${
      isLead ? " blog-antd-archive-timeline__entry--lead" : ""
    }">
  <article class="blog-antd-archive-timeline__item${
      isLead ? " blog-antd-archive-timeline__item--lead" : ""
    }">
    ${
      month
        ? `<div
      id="${escapeHtml(month.anchorId)}"
      class="blog-antd-archive-timeline__month"
    >
      <p class="blog-antd-eyebrow blog-antd-archive-timeline__month-label">${
          escapeHtml(month.label)
        }</p>
    </div>`
        : ""
    }
    <div class="blog-antd-archive-timeline__item-head">
      <span class="blog-antd-story-card__index">${
      formatArchiveIndex(index + 1)
    }</span>
      ${renderMeta(story)}
    </div>
    <h2 class="blog-antd-archive-timeline__title">
      <a href="${escapeHtml(story.url)}">${escapeHtml(story.title)}</a>
    </h2>
    ${
      story.summary
        ? `<p class="blog-antd-archive-timeline__summary">${
          escapeHtml(story.summary)
        }</p>`
        : ""
    }
    ${renderStoryTags(story, language)}
  </article>
</li>`;
  }).join("");

  return `<section class="blog-antd-archive-timeline-wrap" aria-label="${
    escapeHtml(ariaLabel)
  }">
  <ul class="blog-antd-archive-timeline">
    ${items}
  </ul>
</section>`;
}
