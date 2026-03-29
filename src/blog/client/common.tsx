/** @jsxImportSource npm/react */
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
} from "@blog/common-antd";
import type { BlogBreadcrumbItem, BlogStoryCard } from "../view-data.ts";
import {
  BLOG_ANTD_CARD_CLASSNAMES,
  BLOG_ANTD_READING_METER_PROGRESS,
} from "./antd-semantic.ts";

export function renderBreadcrumbItems(items: readonly BlogBreadcrumbItem[]) {
  return items.map(({ href, label }) => ({
    key: href,
    title: <a href={href}>{label}</a>,
  }));
}

/**
 * Blog client payloads already carry trusted server-rendered HTML. Keep the
 * React sink behind named helpers so raw markup remains explicit and rare.
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
) {
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
) {
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
  }: {
    dateIso: string;
    dateLabel: string;
    readingLabel?: string | undefined;
    showReadingLabel?: boolean | undefined;
  },
) {
  return (
    <Flex wrap gap={12} className="blog-antd-story-card__meta">
      <span className="blog-antd-meta-pill">
        <ScheduleOutlined />
        <time dateTime={dateIso}>{dateLabel}</time>
      </span>
      {showReadingLabel && readingLabel && (
        <span className="blog-antd-meta-pill">
          <ReadOutlined />
          <span>{readingLabel}</span>
        </span>
      )}
    </Flex>
  );
}

export function StoryTags({ story }: { story: BlogStoryCard }) {
  const visibleTags = story.tags?.slice(0, 3) ?? [];

  if (visibleTags.length === 0) {
    return null;
  }

  return (
    <Space wrap size={[8, 8]} className="blog-antd-story-tags">
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
) {
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
  { story }: { story: BlogStoryCard },
) {
  return (
    <div className="blog-antd-hero-note__story">
      <a href={story.url} className="blog-antd-hero-note__link">
        <span>{story.title}</span>
        <ArrowRightOutlined />
      </a>
      <MetaLine
        dateIso={story.dateIso}
        dateLabel={story.dateLabel}
        readingLabel={story.readingLabel}
      />
    </div>
  );
}

type StoryCardProps = Readonly<{
  index: number;
  story: BlogStoryCard;
  summaryVisible?: boolean | undefined;
}>;

function StoryCard({ index, story, summaryVisible = true }: StoryCardProps) {
  return (
    <Card
      rootClassName="blog-antd-card blog-antd-story-card"
      classNames={BLOG_ANTD_CARD_CLASSNAMES}
      variant="borderless"
    >
      <a href={story.url} className="blog-antd-story-card__link">
        <Flex vertical gap={14}>
          <div className="blog-antd-story-card__index">
            {formatIndex(index)}
          </div>
          <MetaLine
            dateIso={story.dateIso}
            dateLabel={story.dateLabel}
            readingLabel={story.readingLabel}
            showReadingLabel={false}
          />
          <StoryTags story={story} />
          <Title level={3} className="blog-antd-story-card__title">
            <span>{story.title}</span>
          </Title>
          {summaryVisible && story.summary && (
            <Paragraph className="blog-antd-story-card__summary">
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
  }: {
    posts: readonly BlogStoryCard[];
    ariaLabel: string;
    summaryVisible?: boolean | undefined;
    startIndex?: number | undefined;
  },
) {
  return (
    <div className="blog-antd-story-grid" role="list" aria-label={ariaLabel}>
      <Row gutter={[24, 24]} className="blog-antd-story-grid__row">
        {posts.map((story, index) => (
          <Col key={story.url} xs={24} md={12} role="listitem">
            <div className="blog-antd-story-grid__item">
              <StoryCard
                index={startIndex + index}
                story={story}
                summaryVisible={summaryVisible}
              />
            </div>
          </Col>
        ))}
      </Row>
    </div>
  );
}

function SignalStories(
  { posts }: { posts: readonly BlogStoryCard[] },
) {
  if (posts.length === 0) {
    return null;
  }

  return (
    <div className="blog-antd-signal-list">
      {posts.map((story, index) => (
        <a
          key={story.url}
          href={story.url}
          className="blog-antd-signal-list__item"
        >
          <span className="blog-antd-signal-list__index">
            {formatIndex(index + 1)}
          </span>
          <span className="blog-antd-signal-list__body">
            <span className="blog-antd-signal-list__title">{story.title}</span>
            <MetaLine
              dateIso={story.dateIso}
              dateLabel={story.dateLabel}
              readingLabel={story.readingLabel}
            />
          </span>
        </a>
      ))}
    </div>
  );
}

export function FeaturedStory(
  {
    story,
    secondaryStories,
    title,
  }: {
    story: BlogStoryCard;
    secondaryStories: readonly BlogStoryCard[];
    title: string;
  },
) {
  const hasSecondaryStories = secondaryStories.length > 0;

  return (
    <Card
      rootClassName="blog-antd-card blog-antd-feature-card"
      classNames={BLOG_ANTD_CARD_CLASSNAMES}
      variant="borderless"
    >
      <Row gutter={[32, 24]} align="stretch">
        <Col xs={24} xl={hasSecondaryStories ? 15 : 24}>
          <a href={story.url} className="blog-antd-feature-card__link">
            <Flex vertical gap={18} className="blog-antd-feature-card__main">
              <div className="blog-antd-feature-card__lead">
                <Tag className="blog-antd-count-tag blog-antd-count-tag--soft">
                  {title}
                </Tag>
                <Title
                  level={2}
                  className="blog-antd-feature-card__title"
                >
                  <span>{story.title}</span>
                </Title>
                <MetaLine
                  dateIso={story.dateIso}
                  dateLabel={story.dateLabel}
                  readingLabel={story.readingLabel}
                />
                {story.summary && (
                  <Paragraph className="blog-antd-feature-card__summary">
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
              <SignalStories posts={secondaryStories} />
            </div>
          </Col>
        )}
      </Row>
    </Card>
  );
}
