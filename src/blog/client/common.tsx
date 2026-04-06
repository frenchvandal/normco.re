/** @jsxImportSource npm/react */
import type { CSSProperties, ReactElement } from "npm/react";

import {
  ArrowRightOutlined,
  Card,
  Col,
  Flex,
  Paragraph,
  Progress,
  ReadOutlined,
  Row,
  ScheduleOutlined,
  Space,
  Tag,
  Title,
  Tooltip,
} from "@blog/common-antd";
import type { BlogBreadcrumbItem, BlogStoryCard } from "../view-data.ts";
import { resolvePostTitleViewTransitionAttributes } from "../../utils/view-transitions.ts";
import {
  BLOG_ANTD_CARD_CLASSNAMES,
  BLOG_ANTD_READING_METER_PROGRESS,
  BLOG_ANTD_TOOLTIP_CLASSNAMES,
} from "./antd-semantic.ts";
import {
  PRETEXT_FEATURE_CARD_SUMMARY_CLASS,
  PRETEXT_FEATURE_CARD_SUMMARY_SELECTOR,
  PRETEXT_FEATURE_CARD_TITLE_CLASS,
  PRETEXT_FEATURE_CARD_TITLE_SELECTOR,
  PRETEXT_SIGNAL_LIST_TITLE_CLASS,
  PRETEXT_SIGNAL_LIST_TITLE_SELECTOR,
  PRETEXT_STORY_CARD_SUMMARY_CLASS,
  PRETEXT_STORY_CARD_SUMMARY_SELECTOR,
  PRETEXT_STORY_CARD_TITLE_CLASS,
  PRETEXT_STORY_CARD_TITLE_SELECTOR,
} from "./pretext-selectors.ts";
import { usePretextTextStyle } from "./pretext-story.ts";
import { useBalancedStoryGridTextStyles } from "./pretext-story-grid.ts";
import {
  BLOG_ANTD_ROW_GUTTER_GRID,
  BLOG_ANTD_ROW_GUTTER_SECTION,
  BLOG_ANTD_SPACE_3,
  BLOG_ANTD_SPACE_4,
  BLOG_ANTD_SPACE_SIZE_COMPACT,
} from "./spacing.ts";

type BreadcrumbRenderItem = Readonly<{
  key: string;
  title: ReactElement;
}>;

export function renderBreadcrumbItems(
  items: readonly BlogBreadcrumbItem[],
): BreadcrumbRenderItem[] {
  return items.map(({ href, label }) => ({
    key: href,
    title: <a href={href}>{label}</a>,
  }));
}

/**
 * Blog client payloads already carry trusted server-rendered HTML. Keep the
 * React sink behind named helpers so raw markup remains explicit and rare.
 * This markup comes from the repo's local Markdown/layout pipeline, then gets
 * any final post-processing before it reaches these components.
 */
export function TrustedHtmlSection(
  {
    html,
    className,
    lang,
    ariaLabelledby,
  }: {
    html: string;
    className?: string | undefined;
    lang?: string | undefined;
    ariaLabelledby?: string | undefined;
  },
): ReactElement {
  return (
    <section
      className={className}
      lang={lang}
      aria-labelledby={ariaLabelledby}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export function TrustedHtmlSpan(
  {
    html,
    className,
  }: {
    html: string;
    className?: string | undefined;
  },
): ReactElement {
  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export function formatIndex(index: number): string {
  return index.toString().padStart(2, "0");
}

const READING_METER_MIN_PERCENT = 16;
const READING_METER_PERCENT_PER_MINUTE = 9;

function extractNumericValue(text?: string): number | undefined {
  const match = text?.match(/\d+/);

  if (!match) {
    return undefined;
  }

  return Number.parseInt(match[0], 10);
}

function renderReadingPercent(readingLabel?: string): number | undefined {
  const readingValue = extractNumericValue(readingLabel);

  if (readingValue === undefined) {
    return undefined;
  }

  // Keep short reads visible without letting long reads overflow the compact meter.
  return Math.min(
    100,
    Math.max(
      READING_METER_MIN_PERCENT,
      readingValue * READING_METER_PERCENT_PER_MINUTE,
    ),
  );
}

export function MetaLine(
  {
    dateIso,
    dateLabel,
    readingLabel,
    showReadingLabel = true,
    dateTooltip,
    readingTooltip,
    separator,
    className = "blog-antd-story-card__meta",
  }: {
    dateIso: string;
    dateLabel: string;
    readingLabel?: string | undefined;
    showReadingLabel?: boolean | undefined;
    dateTooltip?: string | undefined;
    readingTooltip?: string | undefined;
    separator?: string | undefined;
    className?: string | undefined;
  },
): ReactElement {
  const datePill = (
    <span className="blog-antd-meta-pill">
      <ScheduleOutlined aria-hidden="true" />
      <time dateTime={dateIso}>{dateLabel}</time>
    </span>
  );
  const readingPill = showReadingLabel && readingLabel && (
    <span className="blog-antd-meta-pill">
      <ReadOutlined aria-hidden="true" />
      <span>{readingLabel}</span>
    </span>
  );
  const showSeparator = separator && readingPill;

  return (
    <Flex wrap gap={BLOG_ANTD_SPACE_3} className={className}>
      {dateTooltip
        ? (
          <Tooltip
            title={dateTooltip}
            classNames={BLOG_ANTD_TOOLTIP_CLASSNAMES}
          >
            {datePill}
          </Tooltip>
        )
        : datePill}
      {showSeparator && (
        <span
          className="blog-antd-meta-separator"
          aria-hidden="true"
        >
          {separator}
        </span>
      )}
      {readingTooltip && readingPill
        ? (
          <Tooltip
            title={readingTooltip}
            classNames={BLOG_ANTD_TOOLTIP_CLASSNAMES}
          >
            {readingPill}
          </Tooltip>
        )
        : readingPill}
    </Flex>
  );
}

export function StoryTags(
  { story }: { story: BlogStoryCard },
): ReactElement | null {
  const visibleTags = story.tags?.slice(0, 3) ?? [];

  if (visibleTags.length === 0) {
    return null;
  }

  return (
    <Space
      wrap
      size={BLOG_ANTD_SPACE_SIZE_COMPACT}
      className="blog-antd-story-tags"
    >
      {visibleTags.map((tag) => (
        <Tag key={tag} className="blog-antd-tag blog-antd-tag--story">
          {tag}
        </Tag>
      ))}
    </Space>
  );
}

export function ReadingMeter(
  { readingLabel, className = "" }: {
    readingLabel?: string | undefined;
    className?: string | undefined;
  },
): ReactElement | null {
  const percent = renderReadingPercent(readingLabel);

  if (percent === undefined || !readingLabel) {
    return null;
  }

  return (
    <div className={`blog-antd-reading-meter ${className}`.trim()}>
      <Progress
        percent={percent}
        showInfo={false}
        size="small"
        rootClassName="blog-antd-progress"
        {...BLOG_ANTD_READING_METER_PROGRESS}
      />
      <span className="blog-antd-reading-meter__label">{readingLabel}</span>
    </div>
  );
}

export function HeroLatestLink(
  { story, dateTooltip, readingTooltip }: {
    story: BlogStoryCard;
    dateTooltip?: string | undefined;
    readingTooltip?: string | undefined;
  },
): ReactElement {
  const titleTransitionAttributes = resolvePostTitleViewTransitionAttributes(
    story.url,
  );

  return (
    <div className="blog-antd-hero-note__story">
      <a href={story.url} className="blog-antd-hero-note__link">
        <span
          {...(titleTransitionAttributes ?? {})}
        >
          {story.title}
        </span>
        <ArrowRightOutlined />
      </a>
      <MetaLine
        dateIso={story.dateIso}
        dateLabel={story.dateLabel}
        readingLabel={story.readingLabel}
        dateTooltip={dateTooltip}
        readingTooltip={readingTooltip}
      />
    </div>
  );
}

type StoryCardProps = Readonly<{
  index: number;
  measureText?: boolean | undefined;
  story: BlogStoryCard;
  summaryVisible?: boolean | undefined;
  textStyle?: CSSProperties | undefined;
  dateTooltip?: string | undefined;
  readingTooltip?: string | undefined;
}>;

export function StoryCard(
  {
    index,
    measureText = true,
    story,
    summaryVisible = true,
    textStyle,
    dateTooltip,
    readingTooltip,
  }: StoryCardProps,
): ReactElement {
  const measuredText = usePretextTextStyle({
    disabled: !measureText,
    summary: summaryVisible ? story.summary : undefined,
    summarySelector: PRETEXT_STORY_CARD_SUMMARY_SELECTOR,
    title: story.title,
    titleSelector: PRETEXT_STORY_CARD_TITLE_SELECTOR,
  });
  const titleTransitionAttributes = resolvePostTitleViewTransitionAttributes(
    story.url,
  );

  return (
    <Card
      rootClassName="blog-antd-card blog-antd-story-card"
      classNames={BLOG_ANTD_CARD_CLASSNAMES}
      style={measureText ? measuredText.style : textStyle}
      variant="borderless"
    >
      <a
        ref={measureText ? measuredText.ref : undefined}
        href={story.url}
        className="blog-antd-story-card__link"
      >
        <Flex vertical gap={BLOG_ANTD_SPACE_4}>
          <div className="blog-antd-story-card__index">
            {formatIndex(index)}
          </div>
          <MetaLine
            dateIso={story.dateIso}
            dateLabel={story.dateLabel}
            readingLabel={story.readingLabel}
            showReadingLabel={false}
            dateTooltip={dateTooltip}
            readingTooltip={readingTooltip}
          />
          <StoryTags story={story} />
          <Title level={3} className={PRETEXT_STORY_CARD_TITLE_CLASS}>
            <span
              {...(titleTransitionAttributes ?? {})}
            >
              {story.title}
            </span>
          </Title>
          {summaryVisible && story.summary && (
            <Paragraph className={PRETEXT_STORY_CARD_SUMMARY_CLASS}>
              {story.summary}
            </Paragraph>
          )}
          <ReadingMeter readingLabel={story.readingLabel} />
        </Flex>
      </a>
    </Card>
  );
}

export function StoryGrid(
  {
    posts,
    ariaLabel,
    summaryVisible = true,
    startIndex = 1,
    dateTooltip,
    readingTooltip,
  }: {
    posts: readonly BlogStoryCard[];
    ariaLabel: string;
    summaryVisible?: boolean | undefined;
    startIndex?: number | undefined;
    dateTooltip?: string | undefined;
    readingTooltip?: string | undefined;
  },
): ReactElement {
  const balancedTextStyles = useBalancedStoryGridTextStyles({
    posts,
    summaryVisible,
  });

  return (
    <div
      ref={balancedTextStyles.ref}
      className="blog-antd-story-grid"
      role="list"
      aria-label={ariaLabel}
    >
      <Row
        gutter={BLOG_ANTD_ROW_GUTTER_GRID}
        className="blog-antd-story-grid__row"
      >
        {posts.map((story, index) => (
          <Col key={story.url} xs={24} md={12} role="listitem">
            <div className="blog-antd-story-grid__item">
              <StoryCard
                index={startIndex + index}
                measureText={false}
                story={story}
                summaryVisible={summaryVisible}
                textStyle={balancedTextStyles.styleMap.get(story.url)}
                dateTooltip={dateTooltip}
                readingTooltip={readingTooltip}
              />
            </div>
          </Col>
        ))}
      </Row>
    </div>
  );
}

function SignalStories(
  { posts, dateTooltip, readingTooltip }: {
    posts: readonly BlogStoryCard[];
    dateTooltip?: string | undefined;
    readingTooltip?: string | undefined;
  },
): ReactElement | null {
  if (posts.length === 0) {
    return null;
  }

  return (
    <div className="blog-antd-signal-list">
      {posts.map((story, index) => (
        <SignalStoryLink
          key={story.url}
          index={index}
          story={story}
          dateTooltip={dateTooltip}
          readingTooltip={readingTooltip}
        />
      ))}
    </div>
  );
}

export function SignalStoryLink(
  {
    index,
    story,
    dateTooltip,
    readingTooltip,
  }: {
    index: number;
    story: BlogStoryCard;
    dateTooltip?: string | undefined;
    readingTooltip?: string | undefined;
  },
): ReactElement {
  const measuredText = usePretextTextStyle({
    title: story.title,
    titleSelector: PRETEXT_SIGNAL_LIST_TITLE_SELECTOR,
  });
  const titleTransitionAttributes = resolvePostTitleViewTransitionAttributes(
    story.url,
  );

  return (
    <a
      ref={measuredText.ref}
      href={story.url}
      className="blog-antd-signal-list__item"
      style={measuredText.style}
    >
      <span className="blog-antd-signal-list__index">
        {formatIndex(index + 1)}
      </span>
      <span className="blog-antd-signal-list__body">
        <span
          className={PRETEXT_SIGNAL_LIST_TITLE_CLASS}
          {...(titleTransitionAttributes ?? {})}
        >
          {story.title}
        </span>
        <MetaLine
          dateIso={story.dateIso}
          dateLabel={story.dateLabel}
          readingLabel={story.readingLabel}
          dateTooltip={dateTooltip}
          readingTooltip={readingTooltip}
        />
      </span>
    </a>
  );
}

export function FeaturedStory(
  {
    story,
    secondaryStories,
    title,
    dateTooltip,
    readingTooltip,
  }: {
    story: BlogStoryCard;
    secondaryStories: readonly BlogStoryCard[];
    title: string;
    dateTooltip?: string | undefined;
    readingTooltip?: string | undefined;
  },
): ReactElement {
  const hasSecondaryStories = secondaryStories.length > 0;
  const measuredText = usePretextTextStyle({
    summary: story.summary,
    summarySelector: PRETEXT_FEATURE_CARD_SUMMARY_SELECTOR,
    title: story.title,
    titleSelector: PRETEXT_FEATURE_CARD_TITLE_SELECTOR,
  });
  const titleTransitionAttributes = resolvePostTitleViewTransitionAttributes(
    story.url,
  );

  return (
    <Card
      rootClassName="blog-antd-card blog-antd-feature-card"
      classNames={BLOG_ANTD_CARD_CLASSNAMES}
      style={measuredText.style}
      variant="borderless"
    >
      <Row gutter={BLOG_ANTD_ROW_GUTTER_SECTION} align="stretch">
        <Col xs={24} xl={hasSecondaryStories ? 15 : 24}>
          <a
            ref={measuredText.ref}
            href={story.url}
            className="blog-antd-feature-card__link"
          >
            <Flex
              vertical
              gap={BLOG_ANTD_SPACE_4}
              className="blog-antd-feature-card__main"
            >
              <div className="blog-antd-feature-card__lead">
                <Tag className="blog-antd-count-tag blog-antd-count-tag--soft">
                  {title}
                </Tag>
                <Title
                  level={2}
                  className={PRETEXT_FEATURE_CARD_TITLE_CLASS}
                >
                  <span
                    {...(titleTransitionAttributes ?? {})}
                  >
                    {story.title}
                  </span>
                </Title>
                <MetaLine
                  dateIso={story.dateIso}
                  dateLabel={story.dateLabel}
                  readingLabel={story.readingLabel}
                  dateTooltip={dateTooltip}
                  readingTooltip={readingTooltip}
                />
                {story.summary && (
                  <Paragraph className={PRETEXT_FEATURE_CARD_SUMMARY_CLASS}>
                    {story.summary}
                  </Paragraph>
                )}
              </div>
              <StoryTags story={story} />
              <ReadingMeter
                readingLabel={story.readingLabel}
                className="blog-antd-reading-meter--featured"
              />
            </Flex>
          </a>
        </Col>
        {hasSecondaryStories && (
          <Col xs={24} xl={9}>
            <div className="blog-antd-feature-card__aside">
              <SignalStories
                posts={secondaryStories}
                dateTooltip={dateTooltip}
                readingTooltip={readingTooltip}
              />
            </div>
          </Col>
        )}
      </Row>
    </Card>
  );
}
