import {
  ArrowRightOutlined,
  Card,
  Col,
  Divider,
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
/** @jsxImportSource react */
import type { BlogBreadcrumbItem, BlogStoryCard } from "../view-data.ts";
import { getBlogTagColor } from "./tag-colors.ts";

export function renderBreadcrumbItems(items: readonly BlogBreadcrumbItem[]) {
  return items.map(({ href, label }) => ({
    key: href,
    title: <a href={href}>{label}</a>,
  }));
}

export function formatIndex(index: number): string {
  return index.toString().padStart(2, "0");
}

function extractNumericValue(text?: string): number | undefined {
  const match = text?.match(/\d+/u);

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

  return Math.min(100, Math.max(16, readingValue * 9));
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
        <Tag
          key={tag}
          color={getBlogTagColor(tag)}
          className="blog-antd-tag blog-antd-tag--story"
        >
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
      <Progress percent={percent} showInfo={false} size="small" />
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
    <Card className="blog-antd-story-card" bordered={false}>
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
          <a href={story.url}>{story.title}</a>
        </Title>
        {summaryVisible && story.summary && (
          <Paragraph className="blog-antd-story-card__summary">
            {story.summary}
          </Paragraph>
        )}
        <ReadingMeter readingLabel={story.readingLabel} />
      </Flex>
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
      <Row gutter={[24, 24]}>
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
  return (
    <Card className="blog-antd-feature-card" bordered={false}>
      <Row gutter={[32, 24]} align="stretch">
        <Col xs={24} xl={15}>
          <Flex vertical gap={18} className="blog-antd-feature-card__main">
            <div className="blog-antd-feature-card__lead">
              <Tag className="blog-antd-count-tag blog-antd-count-tag--soft">
                {title}
              </Tag>
              <Title
                level={2}
                className="blog-antd-feature-card__title"
              >
                <a href={story.url}>{story.title}</a>
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
        </Col>
        <Col xs={24} xl={9}>
          <div className="blog-antd-feature-card__aside">
            <HeroLatestLink story={story} />
            {secondaryStories.length > 0 && (
              <Divider className="blog-antd-feature-card__divider" />
            )}
            <SignalStories posts={secondaryStories} />
          </div>
        </Col>
      </Row>
    </Card>
  );
}
