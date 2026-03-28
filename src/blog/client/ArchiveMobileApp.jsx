/** @jsxImportSource react */
import { useMemo, useState } from "react";

import {
  buildArchiveTimelineEntries,
  groupArchiveMonths,
  groupArchiveYears,
  resolveArchiveLocaleFromDocument,
} from "../archive-common.ts";
import { getTagColor, getTagUrl } from "../../utils/tags.ts";

function buildArchiveIndexLookup(months) {
  const lookup = new Map();

  for (const entry of buildArchiveTimelineEntries(months)) {
    lookup.set(entry.story.url, entry.index + 1);
  }

  return lookup;
}

function StoryDescription({ story, language }) {
  const tags = story.tags?.slice(0, 3) ?? [];

  return (
    <>
      <div className="blog-antd-archive-mobile__meta">
        <time dateTime={story.dateIso}>{story.dateLabel}</time>
        {story.readingLabel && <span aria-hidden="true">·</span>}
        {story.readingLabel && <span>{story.readingLabel}</span>}
      </div>
      {story.summary && (
        <p className="blog-antd-archive-mobile__summary">{story.summary}</p>
      )}
      {tags.length > 0 && (
        <div className="blog-antd-archive-mobile__tags">
          {tags.map((tag) => (
            <a
              key={tag}
              href={getTagUrl(tag, language)}
              className={`tag-link tag-link--${getTagColor(tag)}`}
              rel="tag"
            >
              <span className="tag-link__label">{tag}</span>
            </a>
          ))}
        </div>
      )}
    </>
  );
}

function MonthSection({ month, indexLookup, language }) {
  return (
    <section className="blog-antd-archive-mobile__month-block">
      <header className="blog-antd-archive-mobile__month-head">
        <h2 className="blog-antd-archive-mobile__month-label">{month.label}</h2>
        <span className="blog-antd-archive-mobile__month-count">
          {month.posts.length}
        </span>
      </header>
      <div
        className="blog-antd-archive-mobile__list"
        role="list"
        aria-label={month.label}
      >
        {month.posts.map((story) => (
          <article
            key={story.url}
            className="blog-antd-archive-mobile__item"
            role="listitem"
          >
            <div className="blog-antd-archive-mobile__item-shell">
              <span className="blog-antd-archive-mobile__prefix">
                {String(indexLookup.get(story.url) ?? "").padStart(2, "0")}
              </span>
              <div className="blog-antd-archive-mobile__item-main">
                <a
                  href={story.url}
                  className="blog-antd-archive-mobile__story-link"
                >
                  {story.title}
                </a>
                <StoryDescription story={story} language={language} />
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function YearPanels({ data, months, yearGroups, indexLookup }) {
  const defaultYear = String(yearGroups[0]?.year ?? "");
  const [activeYear, setActiveYear] = useState(defaultYear);

  if (yearGroups.length <= 1) {
    return (
      <div
        className="blog-antd-archive-mobile__months"
        aria-label={data.postsAriaLabel}
      >
        {months.map((month) => (
          <MonthSection
            key={month.key}
            month={month}
            indexLookup={indexLookup}
            language={data.language}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="blog-antd-archive-mobile__years">
      <div
        className="blog-antd-archive-mobile__year-tabs"
        role="tablist"
        aria-label={data.yearsAriaLabel}
      >
        {yearGroups.map((group) => (
          <button
            key={group.year}
            id={`archive-mobile-tab-${group.year}`}
            type="button"
            role="tab"
            aria-selected={String(group.year) === activeYear}
            aria-controls={`archive-mobile-panel-${group.year}`}
            className={`blog-antd-archive-mobile__year-tab${
              String(group.year) === activeYear
                ? " blog-antd-archive-mobile__year-tab--active"
                : ""
            }`}
            onClick={() => setActiveYear(String(group.year))}
          >
            {group.year}
          </button>
        ))}
      </div>
      {yearGroups.map((group) => {
        const isActive = String(group.year) === activeYear;

        return (
          <div
            key={group.year}
            id={`archive-mobile-panel-${group.year}`}
            role="tabpanel"
            aria-labelledby={`archive-mobile-tab-${group.year}`}
            hidden={!isActive}
          >
            {isActive && (
              <div
                className="blog-antd-archive-mobile__months"
                aria-label={data.postsAriaLabel}
              >
                {group.months.map((month) => (
                  <MonthSection
                    key={month.key}
                    month={month}
                    indexLookup={indexLookup}
                    language={data.language}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function BlogAntdArchiveMobileApp({ data }) {
  const locale = resolveArchiveLocaleFromDocument();
  const months = useMemo(() => groupArchiveMonths(data.posts, locale), [
    data.posts,
    locale,
  ]);
  const yearGroups = useMemo(() => groupArchiveYears(months), [months]);
  const indexLookup = useMemo(() => buildArchiveIndexLookup(months), [months]);

  return (
    <div className="site-page-shell site-page-shell--wide blog-antd-page blog-antd-page--archive blog-antd-archive-mobile">
      <div className="blog-antd-stack">
        <section
          className="blog-antd-archive-header"
          aria-labelledby="archive-title"
        >
          <div className="blog-antd-archive-header__copy">
            <span className="blog-antd-count-tag">{data.postsCountLabel}</span>
            <h1 id="archive-title" className="blog-antd-page-title">
              {data.title}
            </h1>
            <p className="blog-antd-page-lead">{data.lead}</p>
          </div>
        </section>

        {data.posts.length > 0
          ? (
            <YearPanels
              data={data}
              months={months}
              yearGroups={yearGroups}
              indexLookup={indexLookup}
            />
          )
          : (
            <section className="blog-antd-archive-mobile__month-block">
              <header className="blog-antd-archive-mobile__month-head">
                <h2 className="blog-antd-archive-mobile__month-label">
                  {data.emptyStateTitle}
                </h2>
              </header>
              <p className="blog-antd-archive-mobile__summary">
                {data.emptyStateMessage}
              </p>
              <p className="blog-antd-archive-mobile__tags">
                <a
                  href={data.emptyStateActionHref}
                  className="tag-link tag-link--blue"
                >
                  <span className="tag-link__label">
                    {data.emptyStateActionLabel}
                  </span>
                </a>
              </p>
            </section>
          )}
      </div>

      <button
        type="button"
        className="blog-antd-archive-mobile__backtop"
        aria-label={data.backToTopLabel}
        onClick={() => globalThis.scrollTo({ top: 0, behavior: "smooth" })}
      >
        <span className="blog-antd-archive-mobile__backtop-label">
          {data.backToTopLabel}
        </span>
      </button>
    </div>
  );
}
