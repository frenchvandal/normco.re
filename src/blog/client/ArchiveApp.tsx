/** @jsxImportSource npm/react */
import {
  Anchor,
  BackTop,
  Button,
  Card,
  Flex,
  Paragraph,
  ReadOutlined,
  ScheduleOutlined,
  Tag,
  Title,
  VerticalAlignTopOutlined,
} from "@blog/archive-antd";

import type { BlogArchiveViewData, BlogStoryCard } from "../view-data.ts";
import {
  type ArchiveMonthGroup,
  groupArchiveMonths,
  resolveArchiveLocaleFromDocument,
} from "../archive-common.ts";
import {
  buildArchiveMonthNavModel,
  buildArchiveTimelineItemModels,
} from "../archive-view-model.ts";
import {
  BLOG_ANTD_BACKTOP_CLASSNAMES,
  BLOG_ANTD_CARD_CLASSNAMES,
  BLOG_ANTD_PRIMARY_BUTTON_ROOT,
} from "./antd-semantic.ts";
import { StoryTags } from "./common.tsx";

function ArchiveTimelineItem(
  {
    story,
    indexLabel,
    isLead = false,
    month,
  }: {
    story: BlogStoryCard;
    indexLabel: string;
    isLead?: boolean | undefined;
    month?: ArchiveMonthGroup | undefined;
  },
) {
  return (
    <article
      className={`blog-antd-archive-timeline__item${
        isLead ? " blog-antd-archive-timeline__item--lead" : ""
      }`}
    >
      {month && (
        <div
          id={month.anchorId}
          className="blog-antd-archive-timeline__month"
        >
          <p className="blog-antd-eyebrow blog-antd-archive-timeline__month-label">
            {month.label}
          </p>
        </div>
      )}
      <div className="blog-antd-archive-timeline__item-head">
        <span className="blog-antd-story-card__index">{indexLabel}</span>
        <Flex wrap gap={12} className="blog-antd-archive-timeline__meta">
          <span className="blog-antd-meta-pill">
            <ScheduleOutlined />
            <time dateTime={story.dateIso}>{story.dateLabel}</time>
          </span>
          {story.readingLabel && (
            <span
              className="blog-antd-archive-timeline__separator"
              aria-hidden="true"
            >
              ·
            </span>
          )}
          {story.readingLabel && (
            <span className="blog-antd-meta-pill">
              <ReadOutlined />
              <span>{story.readingLabel}</span>
            </span>
          )}
        </Flex>
      </div>
      <Title
        level={3}
        className="blog-antd-archive-timeline__title"
      >
        <a href={story.url}>{story.title}</a>
      </Title>
      {story.summary && (
        <Paragraph className="blog-antd-archive-timeline__summary">
          {story.summary}
        </Paragraph>
      )}
      <StoryTags story={story} />
    </article>
  );
}

function ArchiveTimeline(
  {
    months,
    ariaLabel,
  }: {
    months: readonly ArchiveMonthGroup[];
    ariaLabel: string;
  },
) {
  if (months.length === 0) {
    return null;
  }

  const timelineEntries = buildArchiveTimelineItemModels(months);

  return (
    <section className="blog-antd-archive-timeline-wrap" aria-label={ariaLabel}>
      <ul className="blog-antd-archive-timeline">
        {timelineEntries.map((entry) => (
          <li
            key={entry.key}
            className={`blog-antd-archive-timeline__entry${
              entry.isLead ? " blog-antd-archive-timeline__entry--lead" : ""
            }`}
          >
            <ArchiveTimelineItem
              story={entry.story}
              indexLabel={entry.indexLabel}
              isLead={entry.isLead}
              month={entry.month}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

function ArchiveMonthNav(
  {
    months,
    ariaLabel,
    eyebrowLabel,
  }: {
    months: readonly ArchiveMonthGroup[];
    ariaLabel: string;
    eyebrowLabel: string;
  },
) {
  const model = buildArchiveMonthNavModel(months);

  if (!model) {
    return null;
  }

  return (
    <aside className="blog-antd-archive-nav" aria-label={ariaLabel}>
      <div className="blog-antd-archive-nav__intro">
        <p className="blog-antd-eyebrow">{eyebrowLabel}</p>
        <Paragraph className="blog-antd-archive-nav__range">
          {model.oldestMonthLabel} - {model.newestMonthLabel}
        </Paragraph>
      </div>
      <div className="blog-antd-archive-month-groups">
        {model.years.map((yearGroup) => (
          <section
            key={yearGroup.year}
            className="blog-antd-archive-month-group"
            aria-labelledby={yearGroup.labelId}
          >
            <p
              id={yearGroup.labelId}
              className="blog-antd-archive-month-group__year"
            >
              <span className="blog-antd-archive-month-group__year-label">
                {yearGroup.year}
              </span>
              <span className="blog-antd-archive-month-group__year-count">
                {yearGroup.yearCountLabel}
              </span>
            </p>
            <Anchor
              affix={false}
              className="blog-antd-archive-anchor"
              direction="horizontal"
              replace
              targetOffset={112}
              items={yearGroup.months.map((month) => ({
                key: month.key,
                href: `#${month.anchorId}`,
                title: (
                  <span
                    className="blog-antd-archive-anchor__title"
                    title={month.title}
                  >
                    <span className="blog-antd-archive-anchor__label">
                      {month.shortLabel}
                    </span>
                    <span className="blog-antd-archive-anchor__count">
                      {month.countLabel}
                    </span>
                  </span>
                ),
              }))}
            />
          </section>
        ))}
      </div>
    </aside>
  );
}

export function ArchiveView(
  { data, interactive = true }: {
    data: BlogArchiveViewData;
    interactive?: boolean | undefined;
  },
) {
  const archiveMonths = groupArchiveMonths(
    data.posts,
    resolveArchiveLocaleFromDocument(),
  );

  return (
    <div className="site-page-shell site-page-shell--wide blog-antd-page blog-antd-page--archive">
      <div className="blog-antd-stack">
        <section className="blog-antd-archive-header">
          <Flex vertical gap={16} className="blog-antd-archive-header__copy">
            <Tag className="blog-antd-count-tag">
              {data.postsCountLabel}
            </Tag>
            <Title level={1} className="blog-antd-page-title">
              {data.title}
            </Title>
            <Paragraph className="blog-antd-page-lead">
              {data.lead}
            </Paragraph>
          </Flex>
        </section>

        {data.posts.length > 0
          ? (
            <div
              className={`blog-antd-archive-layout${
                archiveMonths.length > 1
                  ? " blog-antd-archive-layout--with-nav"
                  : ""
              }`}
            >
              {archiveMonths.length > 1 && (
                <ArchiveMonthNav
                  months={archiveMonths}
                  ariaLabel={data.yearsAriaLabel}
                  eyebrowLabel={data.postsCountLabel}
                />
              )}
              <ArchiveTimeline
                months={archiveMonths}
                ariaLabel={data.postsAriaLabel}
              />
            </div>
          )
          : (
            <Card
              rootClassName="blog-antd-card blog-antd-empty-card"
              classNames={BLOG_ANTD_CARD_CLASSNAMES}
              variant="borderless"
            >
              <Title level={4} className="blog-antd-rail-title">
                {data.emptyStateTitle}
              </Title>
              <div className="blog-antd-empty-card__actions">
                <Button
                  type="primary"
                  href={data.emptyStateActionHref}
                  rootClassName={BLOG_ANTD_PRIMARY_BUTTON_ROOT}
                >
                  {data.emptyStateActionLabel}
                </Button>
              </div>
            </Card>
          )}
      </div>
      {interactive && (
        <BackTop
          visibilityHeight={280}
          rootClassName="blog-antd-backtop"
          classNames={BLOG_ANTD_BACKTOP_CLASSNAMES}
          icon={<VerticalAlignTopOutlined />}
        />
      )}
    </div>
  );
}
