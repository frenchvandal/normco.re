/** @jsxImportSource npm/react */
import { type ReactElement, useMemo } from "npm/react";

import {
  Anchor,
  BackTop,
  Button,
  Card,
  Flex,
  Paragraph,
  Skeleton,
  Tag,
  Title,
  VerticalAlignTopOutlined,
} from "@blog/archive-antd";
import { MetaLine, StoryTags } from "./common.tsx";

import type { BlogArchiveViewData } from "../view-data.ts";
import {
  type ArchiveMonthNavModel,
  type ArchiveTimelineItemModel,
  buildArchiveViewModel,
} from "../archive-view-model.ts";
import { resolveArchiveLocaleFromDocument } from "../archive-common.ts";
import {
  BLOG_ANTD_BACKTOP_CLASSNAMES,
  BLOG_ANTD_CARD_CLASSNAMES,
  BLOG_ANTD_PRIMARY_BUTTON_ROOT,
  BLOG_ANTD_SKELETON_CLASSNAMES,
} from "./antd-semantic.ts";
import {
  PRETEXT_ARCHIVE_TIMELINE_SUMMARY_CLASS,
  PRETEXT_ARCHIVE_TIMELINE_SUMMARY_SELECTOR,
  PRETEXT_ARCHIVE_TIMELINE_TITLE_CLASS,
  PRETEXT_ARCHIVE_TIMELINE_TITLE_SELECTOR,
} from "./pretext-selectors.ts";
import { usePretextTextStyle } from "./pretext-story.ts";
import { BLOG_ANTD_SPACE_4 } from "./spacing.ts";

type ArchiveMonthNavYearGroup = ArchiveMonthNavModel["years"][number];
type ArchiveMonthNavAnchorItem = Readonly<{
  key: string;
  href: string;
  title: ReactElement;
}>;
type ArchiveMonthNavYearGroupWithAnchorItems =
  & ArchiveMonthNavYearGroup
  & Readonly<{
    anchorItems: ArchiveMonthNavAnchorItem[];
  }>;

export function ArchiveTimelineItem(
  {
    story,
    indexLabel,
    isLead = false,
    month,
    dateTooltip,
    readingTooltip,
  }: {
    story: ArchiveTimelineItemModel["story"];
    indexLabel: string;
    isLead?: boolean | undefined;
    month?: ArchiveTimelineItemModel["month"];
    dateTooltip?: string | undefined;
    readingTooltip?: string | undefined;
  },
) {
  const measuredText = usePretextTextStyle({
    summary: story.summary,
    summarySelector: PRETEXT_ARCHIVE_TIMELINE_SUMMARY_SELECTOR,
    title: story.title,
    titleSelector: PRETEXT_ARCHIVE_TIMELINE_TITLE_SELECTOR,
  });

  return (
    <article
      ref={measuredText.ref}
      className={`blog-antd-archive-timeline__item${
        isLead ? " blog-antd-archive-timeline__item--lead" : ""
      }`}
      style={measuredText.style}
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
        <MetaLine
          dateIso={story.dateIso}
          dateLabel={story.dateLabel}
          readingLabel={story.readingLabel}
          separator="·"
          className="blog-antd-archive-timeline__meta"
          dateTooltip={dateTooltip}
          readingTooltip={readingTooltip}
        />
      </div>
      <Title
        level={3}
        className={PRETEXT_ARCHIVE_TIMELINE_TITLE_CLASS}
      >
        <a href={story.url}>{story.title}</a>
      </Title>
      {story.summary && (
        <Paragraph className={PRETEXT_ARCHIVE_TIMELINE_SUMMARY_CLASS}>
          {story.summary}
        </Paragraph>
      )}
      <StoryTags story={story} />
    </article>
  );
}

function ArchiveTimeline(
  {
    items,
    ariaLabel,
    dateTooltip,
    readingTooltip,
  }: {
    items: readonly ArchiveTimelineItemModel[];
    ariaLabel: string;
    dateTooltip?: string | undefined;
    readingTooltip?: string | undefined;
  },
) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="blog-antd-archive-timeline-wrap" aria-label={ariaLabel}>
      <ul className="blog-antd-archive-timeline">
        {items.map((entry) => (
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
              dateTooltip={dateTooltip}
              readingTooltip={readingTooltip}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

function ArchiveMonthNav(
  {
    model,
    ariaLabel,
    eyebrowLabel,
  }: {
    model?: ArchiveMonthNavModel | undefined;
    ariaLabel: string;
    eyebrowLabel: string;
  },
) {
  const yearGroups = useMemo<
    readonly ArchiveMonthNavYearGroupWithAnchorItems[]
  >(
    () =>
      model?.years.map((yearGroup) => ({
        ...yearGroup,
        anchorItems: yearGroup.months.map((month) => ({
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
        })),
      })) ?? [],
    [model],
  );

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
        {yearGroups.map((yearGroup) => (
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
              items={yearGroup.anchorItems}
            />
          </section>
        ))}
      </div>
    </aside>
  );
}

function ArchiveLoadingSkeleton() {
  return (
    <div className="blog-antd-archive-skeleton">
      <Skeleton
        active
        title={{ width: "40%" }}
        paragraph={{ rows: 0 }}
        classNames={BLOG_ANTD_SKELETON_CLASSNAMES}
      />
      <Skeleton
        active
        title={false}
        paragraph={{ rows: 6 }}
        classNames={BLOG_ANTD_SKELETON_CLASSNAMES}
      />
    </div>
  );
}

export function ArchiveView(
  { data, interactive = true, loading = false }: {
    data: BlogArchiveViewData;
    interactive?: boolean | undefined;
    loading?: boolean | undefined;
  },
) {
  const archiveLocale = useMemo(
    resolveArchiveLocaleFromDocument,
    [],
  );
  const archiveView = useMemo(
    () => buildArchiveViewModel(data.posts, archiveLocale),
    [archiveLocale, data.posts],
  );

  if (loading) {
    return (
      <div className="site-page-shell site-page-shell--wide blog-antd-page blog-antd-page--archive">
        <div className="blog-antd-stack">
          <ArchiveLoadingSkeleton />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="site-page-shell site-page-shell--wide blog-antd-page blog-antd-page--archive">
        <div className="blog-antd-stack">
          <section className="blog-antd-archive-header">
            <Flex
              vertical
              gap={BLOG_ANTD_SPACE_4}
              className="blog-antd-archive-header__copy"
            >
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

          {archiveView.hasPosts
            ? (
              <div className={archiveView.layoutClassName}>
                {archiveView.monthNav && (
                  <ArchiveMonthNav
                    model={archiveView.monthNav}
                    ariaLabel={data.yearsAriaLabel}
                    eyebrowLabel={data.postsCountLabel}
                  />
                )}
                <ArchiveTimeline
                  items={archiveView.timelineItems}
                  ariaLabel={data.postsAriaLabel}
                  dateTooltip={data.dateTooltip}
                  readingTooltip={data.readingTooltip}
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
      </div>
      {interactive && (
        <BackTop
          visibilityHeight={280}
          rootClassName="blog-antd-backtop"
          classNames={BLOG_ANTD_BACKTOP_CLASSNAMES}
          icon={<VerticalAlignTopOutlined />}
        />
      )}
    </>
  );
}
