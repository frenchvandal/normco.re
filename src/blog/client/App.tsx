/** @jsxImportSource react */
import dayjs, { type Dayjs } from "dayjs";
import { useState } from "react";
import type {
  BlogAppViewData,
  BlogArchiveViewData,
  BlogBreadcrumbItem,
  BlogPostViewData,
  BlogStoryCard,
  BlogTagViewData,
} from "../view-data.ts";
import { getBlogTagColor } from "./tag-colors.ts";
import type { CalendarProps } from "@blog/antd-components";
import {
  BackTop,
  Breadcrumb,
  Button,
  Calendar,
  Card,
  Col,
  ConfigProvider,
  Descriptions,
  Divider,
  Empty,
  Flex,
  Paragraph,
  Progress,
  Row,
  Space,
  Statistic,
  Tag,
  Timeline,
  Title,
  Tooltip,
} from "@blog/antd-components";
import {
  ArrowRightOutlined,
  BarChartOutlined,
  FileTextOutlined,
  LeftOutlined,
  NodeIndexOutlined,
  ProfileOutlined,
  ReadOutlined,
  RightOutlined,
  ScheduleOutlined,
  SwapOutlined,
  TagsOutlined,
  VerticalAlignTopOutlined,
} from "@blog/antd-icons";
import { BLOG_ANTD_THEME } from "./theme.ts";

type StoryCardProps = Readonly<{
  index: number;
  story: BlogStoryCard;
  summaryVisible?: boolean | undefined;
}>;

type ArchiveCalendarValue = CalendarProps<Dayjs>;
type ArchiveCalendarHeader = Parameters<
  NonNullable<ArchiveCalendarValue["headerRender"]>
>[0];
type ArchiveCalendarCellInfo = Parameters<
  NonNullable<ArchiveCalendarValue["fullCellRender"]>
>[1];
type ArchiveCalendarSelectInfo = Parameters<
  NonNullable<ArchiveCalendarValue["onSelect"]>
>[1];

function renderBreadcrumbItems(items: readonly BlogBreadcrumbItem[]) {
  return items.map(({ href, label }) => ({
    key: href,
    title: <a href={href}>{label}</a>,
  }));
}

function formatIndex(index: number): string {
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

type ArchiveMonthGroup = Readonly<{
  key: string;
  year: number;
  label: string;
  shortLabel: string;
  anchorId: string;
  posts: readonly BlogStoryCard[];
}>;

function resolveArchiveLocale(): string {
  if (typeof document === "undefined") {
    return "en";
  }

  const lang = document.documentElement.lang.toLowerCase();

  switch (lang) {
    case "zh-hans":
      return "zh-CN";
    case "zh-hant":
      return "zh-TW";
    default:
      return lang || "en";
  }
}

function formatArchiveMonth(
  monthKey: string,
  locale: string,
): Pick<ArchiveMonthGroup, "label" | "shortLabel" | "year"> {
  const [yearText = "0", monthText = "1"] = monthKey.split("-");
  const year = Number.parseInt(yearText, 10);
  const month = Number.parseInt(monthText, 10);
  const date = new Date(Date.UTC(year, month - 1, 1));

  return {
    year,
    label: new Intl.DateTimeFormat(locale, {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(date),
    shortLabel: new Intl.DateTimeFormat(locale, {
      month: "short",
      timeZone: "UTC",
    }).format(date),
  };
}

function createArchiveMonthDate(monthKey: string): Dayjs {
  return dayjs(`${monthKey}-01`);
}

function groupArchiveMonths(
  posts: readonly BlogStoryCard[],
): readonly ArchiveMonthGroup[] {
  const locale = resolveArchiveLocale();
  const months = new Map<string, {
    year: number;
    label: string;
    shortLabel: string;
    anchorId: string;
    posts: BlogStoryCard[];
  }>();

  for (const story of posts) {
    const key = story.dateIso.slice(0, 7);
    const existingMonth = months.get(key);

    if (existingMonth) {
      existingMonth.posts.push(story);
      continue;
    }

    const { year, label, shortLabel } = formatArchiveMonth(key, locale);
    months.set(key, {
      year,
      label,
      shortLabel,
      anchorId: `archive-month-${key}`,
      posts: [story],
    });
  }

  return Array.from(months, ([key, month]) => ({
    key,
    year: month.year,
    label: month.label,
    shortLabel: month.shortLabel,
    anchorId: month.anchorId,
    posts: month.posts,
  }));
}

function scrollToArchiveMonth(anchorId: string): void {
  if (typeof document === "undefined") {
    return;
  }

  document.getElementById(anchorId)?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

function MetaLine(
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

function StoryTags({ story }: { story: BlogStoryCard }) {
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

function ReadingMeter(
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

function HeroLatestLink(
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

function ArchiveTimelineItem(
  {
    story,
    index,
    isLead = false,
    month,
  }: {
    story: BlogStoryCard;
    index: number;
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
        <span className="blog-antd-story-card__index">
          {formatIndex(index + 1)}
        </span>
        <Flex wrap gap={12} className="blog-antd-archive-timeline__meta">
          <span className="blog-antd-meta-pill">
            <ScheduleOutlined />
            <time dateTime={story.dateIso}>{story.dateLabel}</time>
          </span>
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

  let timelineIndex = 0;

  return (
    <section className="blog-antd-archive-timeline-wrap" aria-label={ariaLabel}>
      <Timeline
        className="blog-antd-archive-timeline"
        variant="outlined"
        items={months.flatMap((month) =>
          month.posts.map((story, monthIndex) => {
            const item = {
              color: monthIndex === 0 ? "blue" : "gray",
              content: (
                <ArchiveTimelineItem
                  story={story}
                  index={timelineIndex}
                  isLead={timelineIndex === 0}
                  month={monthIndex === 0 ? month : undefined}
                />
              ),
            };

            timelineIndex += 1;
            return item;
          })
        )}
      />
    </section>
  );
}

function ArchiveCalendarNav(
  { months, label }: { months: readonly ArchiveMonthGroup[]; label: string },
) {
  const newestMonth = months[0];
  const oldestMonth = months[months.length - 1];

  if (!newestMonth || !oldestMonth) {
    return null;
  }

  const [selectedMonth, setSelectedMonth] = useState(() =>
    createArchiveMonthDate(newestMonth.key)
  );
  const monthMap = new Map(months.map((month) => [month.key, month]));
  const monthKeys = new Set(months.map((month) => month.key));

  return (
    <aside className="blog-antd-archive-nav" aria-label={label}>
      <div className="blog-antd-archive-nav__intro">
        <p className="blog-antd-eyebrow">{label}</p>
        <Paragraph className="blog-antd-archive-nav__range">
          {oldestMonth.label} - {newestMonth.label}
        </Paragraph>
      </div>
      <Calendar
        className="blog-antd-archive-calendar"
        fullscreen={false}
        mode="year"
        value={selectedMonth}
        validRange={[
          createArchiveMonthDate(oldestMonth.key),
          createArchiveMonthDate(newestMonth.key),
        ]}
        disabledDate={(currentDate: Dayjs) =>
          !monthKeys.has(currentDate.format("YYYY-MM"))}
        headerRender={({ value, onChange }: ArchiveCalendarHeader) => {
          const canGoBackward = value.year() > oldestMonth.year;
          const canGoForward = value.year() < newestMonth.year;

          return (
            <Flex
              align="center"
              justify="space-between"
              className="blog-antd-archive-calendar__header"
            >
              <Button
                type="text"
                size="small"
                icon={<LeftOutlined />}
                disabled={!canGoBackward}
                aria-label={String(value.year() - 1)}
                onClick={() => {
                  const nextValue = value.subtract(1, "year");
                  setSelectedMonth(nextValue);
                  onChange(nextValue);
                }}
              />
              <span className="blog-antd-archive-calendar__year">
                {value.format("YYYY")}
              </span>
              <Button
                type="text"
                size="small"
                icon={<RightOutlined />}
                disabled={!canGoForward}
                aria-label={String(value.year() + 1)}
                onClick={() => {
                  const nextValue = value.add(1, "year");
                  setSelectedMonth(nextValue);
                  onChange(nextValue);
                }}
              />
            </Flex>
          );
        }}
        fullCellRender={(currentDate: Dayjs, info: ArchiveCalendarCellInfo) => {
          if (info.type !== "year") {
            return info.originNode;
          }

          const month = monthMap.get(currentDate.format("YYYY-MM"));
          const isSelected = currentDate.format("YYYY-MM") ===
            selectedMonth.format("YYYY-MM");
          const cell = (
            <div
              className={`blog-antd-archive-calendar__cell${
                month ? "" : " blog-antd-archive-calendar__cell--empty"
              }${
                isSelected ? " blog-antd-archive-calendar__cell--selected" : ""
              }`}
            >
              <span className="blog-antd-archive-calendar__cell-label">
                {month?.shortLabel ?? currentDate.format("MMM")}
              </span>
              {month && (
                <span className="blog-antd-archive-calendar__cell-count">
                  {formatIndex(month.posts.length)}
                </span>
              )}
            </div>
          );

          if (!month) {
            return cell;
          }

          return (
            <Tooltip
              color="geekblue"
              placement="top"
              title={`${month.label} • ${formatIndex(month.posts.length)}`}
            >
              {cell}
            </Tooltip>
          );
        }}
        onPanelChange={(value: Dayjs) => {
          setSelectedMonth(value);
        }}
        onSelect={(value: Dayjs, info: ArchiveCalendarSelectInfo) => {
          setSelectedMonth(value);

          if (info.source === "year") {
            return;
          }

          const month = monthMap.get(value.format("YYYY-MM"));

          if (month) {
            scrollToArchiveMonth(month.anchorId);
          }
        }}
      />
    </aside>
  );
}

function StoryGrid(
  {
    posts,
    ariaLabel,
    summaryVisible = true,
    startIndex = 1,
  }: {
    posts: readonly BlogStoryCard[];
    ariaLabel: string;
    summaryVisible?: boolean;
    startIndex?: number;
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

function FeaturedStory(
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

function ArchiveView(
  { data }: { data: BlogArchiveViewData },
) {
  const archiveMonths = groupArchiveMonths(data.posts);

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
            <div className="blog-antd-archive-layout">
              {archiveMonths.length > 1 && (
                <ArchiveCalendarNav
                  months={archiveMonths}
                  label={data.postsCountLabel}
                />
              )}
              <ArchiveTimeline
                months={archiveMonths}
                ariaLabel={data.postsAriaLabel}
              />
            </div>
          )
          : (
            <Card className="blog-antd-empty-card" bordered={false}>
              <Title level={4} className="blog-antd-rail-title">
                {data.emptyStateTitle}
              </Title>
              <Empty
                description={data.emptyStateMessage}
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
              <div className="blog-antd-empty-card__actions">
                <Button type="primary" href={data.emptyStateActionHref}>
                  {data.emptyStateActionLabel}
                </Button>
              </div>
            </Card>
          )}
      </div>
      <BackTop
        visibilityHeight={280}
        icon={<VerticalAlignTopOutlined />}
      />
    </div>
  );
}

function TagView(
  { data }: { data: BlogTagViewData },
) {
  const featuredStory = data.posts[0];
  const latestStory = data.posts[1];
  const remainingStories = data.posts.slice(1);

  return (
    <div className="site-page-shell site-page-shell--editorial blog-antd-page blog-antd-page--tag">
      <div className="blog-antd-stack">
        <nav aria-label={data.breadcrumbAriaLabel}>
          <Breadcrumb
            className="blog-antd-breadcrumb"
            items={renderBreadcrumbItems(data.breadcrumb)}
          />
        </nav>

        <section className="blog-antd-hero blog-antd-hero--tag">
          <Row gutter={[32, 24]} align="middle">
            <Col xs={24} lg={16}>
              <Flex vertical gap={16} className="blog-antd-hero__copy">
                <p className="blog-antd-eyebrow">{data.eyebrow}</p>
                <Title level={1} className="blog-antd-page-title">
                  {data.title}
                </Title>
                <Paragraph className="blog-antd-page-lead">
                  {data.postsCountLabel}
                </Paragraph>
              </Flex>
            </Col>
            <Col xs={24} lg={8}>
              <Flex
                vertical
                gap={16}
                className="blog-antd-hero-note blog-antd-hero-note--tag"
              >
                <Tag className="blog-antd-count-tag blog-antd-count-tag--soft">
                  {data.title}
                </Tag>
                <Button type="primary" href={data.archiveUrl}>
                  {data.archiveLinkLabel}
                </Button>
                {latestStory && <HeroLatestLink story={latestStory} />}
              </Flex>
            </Col>
          </Row>
        </section>

        {data.posts.length > 0
          ? (
            <>
              {featuredStory && (
                <FeaturedStory
                  story={featuredStory}
                  secondaryStories={remainingStories.slice(0, 3)}
                  title={data.postsCountLabel}
                />
              )}
              {remainingStories.length > 0 && (
                <StoryGrid
                  posts={remainingStories}
                  ariaLabel={data.postsAriaLabel}
                  startIndex={2}
                />
              )}
            </>
          )
          : (
            <Card className="blog-antd-empty-card" bordered={false}>
              <Empty
                description={data.emptyStateMessage}
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </Card>
          )}
      </div>
      <BackTop
        visibilityHeight={280}
        icon={<VerticalAlignTopOutlined />}
      />
    </div>
  );
}

function PostView(
  { data }: { data: BlogPostViewData },
) {
  const hasRail = data.outline.length > 0 || data.tags.length > 0 ||
    data.backlinks.length > 0 || data.previous || data.next;

  return (
    <div className="site-page-shell site-page-shell--wide blog-antd-page blog-antd-page--post">
      <div
        className={`feature-layout${
          hasRail ? " feature-layout--with-rail" : ""
        }`}
      >
        <article
          className="post-article feature-main blog-antd-post-article"
          data-code-copy-label={data.codeCopyLabel}
          data-code-copy-feedback={data.codeCopyFeedback}
          data-code-copy-failed-feedback={data.codeCopyFailedFeedback}
        >
          <nav aria-label={data.breadcrumbAriaLabel}>
            <Breadcrumb
              className="blog-antd-breadcrumb"
              items={renderBreadcrumbItems(data.breadcrumb)}
            />
          </nav>

          <section className="blog-antd-hero blog-antd-hero--post">
            <Row gutter={[32, 24]} align="top">
              <Col xs={24} xl={15}>
                <Flex vertical gap={16} className="blog-antd-post-header__copy">
                  <Tag className="blog-antd-count-tag blog-antd-count-tag--soft">
                    {data.publishedDateLabel}
                  </Tag>
                  <Title
                    id="post-title"
                    level={1}
                    className="blog-antd-page-title"
                  >
                    {data.title}
                  </Title>
                  <MetaLine
                    dateIso={data.publishedDateIso}
                    dateLabel={data.publishedDateLabel}
                    readingLabel={data.readingTimeLabel}
                  />
                  {data.summaryItems.length > 0 && (
                    <div className="blog-antd-post-metrics">
                      {data.summaryItems.map((item) => (
                        <Card
                          key={item.key}
                          className="blog-antd-post-metric-card"
                          bordered={false}
                        >
                          <Statistic
                            title={item.label}
                            value={item.value}
                            prefix={<BarChartOutlined />}
                          />
                        </Card>
                      ))}
                    </div>
                  )}
                </Flex>
              </Col>
              <Col xs={24} xl={9}>
                {(data.summary || data.readingTimeLabel) && (
                  <div className="blog-antd-post-summary blog-antd-post-summary--hero">
                    {data.summary && (
                      <>
                        <p className="blog-antd-eyebrow">
                          {data.summaryEyebrow}
                        </p>
                        <Paragraph className="blog-antd-page-lead blog-antd-page-lead--summary">
                          {data.summary}
                        </Paragraph>
                      </>
                    )}
                    <ReadingMeter
                      readingLabel={data.readingTimeLabel}
                      className="blog-antd-reading-meter--featured"
                    />
                  </div>
                )}
              </Col>
            </Row>
          </section>

          <Divider className="blog-antd-section-divider" />

          <section
            className="post-content"
            lang={data.languageTag}
            aria-labelledby="post-title"
            dangerouslySetInnerHTML={{ __html: data.contentHtml }}
          />

          <Card className="blog-antd-details-card" bordered={false}>
            <Flex align="center" gap={10} className="blog-antd-rail-head">
              <FileTextOutlined />
              <Title level={4} className="blog-antd-rail-title">
                {data.detailsTitle}
              </Title>
            </Flex>
            <Descriptions
              column={1}
              items={data.publicationDetails.map((item) => ({
                key: item.key,
                label: item.label,
                children: (
                  <span dangerouslySetInnerHTML={{ __html: item.valueHtml }} />
                ),
              }))}
            />
          </Card>
        </article>

        {hasRail && (
          <aside
            className="feature-rail post-rail blog-antd-rail"
            aria-label={data.railAriaLabel}
          >
            <div className="feature-rail-sticky blog-antd-rail-stack">
              {data.outline.length > 0 && (
                <Card className="blog-antd-rail-card" bordered={false}>
                  <Flex align="center" gap={10} className="blog-antd-rail-head">
                    <ProfileOutlined />
                    <Title
                      level={4}
                      className="blog-antd-rail-title"
                    >
                      {data.sectionsTitle}
                    </Title>
                  </Flex>
                  <Timeline
                    className="blog-antd-outline-timeline"
                    items={data.outline.map((item) => ({
                      color: item.level === 2 ? "blue" : "gray",
                      content: <a href={`#${item.id}`}>{item.text}</a>,
                    }))}
                  />
                </Card>
              )}

              {data.tags.length > 0 && (
                <Card className="blog-antd-rail-card" bordered={false}>
                  <Flex align="center" gap={10} className="blog-antd-rail-head">
                    <TagsOutlined />
                    <Title
                      level={4}
                      className="blog-antd-rail-title"
                    >
                      {data.tagsTitle}
                    </Title>
                  </Flex>
                  <Space wrap>
                    {data.tags.map((tag) => (
                      <Tag
                        key={tag.url}
                        color={getBlogTagColor(tag.label)}
                        className="blog-antd-tag"
                      >
                        <a href={tag.url} title={tag.title} rel="tag">
                          {tag.label}
                        </a>
                      </Tag>
                    ))}
                  </Space>
                </Card>
              )}

              {data.backlinks.length > 0 && (
                <Card className="blog-antd-rail-card" bordered={false}>
                  <Flex align="center" gap={10} className="blog-antd-rail-head">
                    <NodeIndexOutlined />
                    <Title
                      level={4}
                      className="blog-antd-rail-title"
                    >
                      {data.backlinksTitle}
                    </Title>
                  </Flex>
                  <ul className="blog-antd-link-list">
                    {data.backlinks.map((item) => (
                      <li key={item.url}>
                        <a href={item.url}>{item.title}</a>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              {(data.previous || data.next) && (
                <Card className="blog-antd-rail-card" bordered={false}>
                  <Flex align="center" gap={10} className="blog-antd-rail-head">
                    <SwapOutlined />
                    <Title
                      level={4}
                      className="blog-antd-rail-title"
                    >
                      {data.navigationAriaLabel}
                    </Title>
                  </Flex>
                  <Space
                    direction="vertical"
                    size="small"
                    className="blog-antd-nav-stack"
                  >
                    {data.previous && (
                      <Button href={data.previous.url} block>
                        {data.previousLabel}: {data.previous.title}
                      </Button>
                    )}
                    {data.next && (
                      <Button type="primary" href={data.next.url} block>
                        {data.nextLabel}: {data.next.title}
                      </Button>
                    )}
                  </Space>
                </Card>
              )}
            </div>
          </aside>
        )}
      </div>
      <BackTop
        visibilityHeight={320}
        icon={<VerticalAlignTopOutlined />}
      />
    </div>
  );
}

function BlogAntdContent({ data }: { data: BlogAppViewData }) {
  switch (data.view) {
    case "archive":
      return <ArchiveView data={data} />;
    case "tag":
      return <TagView data={data} />;
    case "post":
      return <PostView data={data} />;
  }
}

export function BlogAntdArchiveApp(
  { data }: { data: BlogArchiveViewData },
) {
  return (
    <ConfigProvider theme={BLOG_ANTD_THEME}>
      <ArchiveView data={data} />
    </ConfigProvider>
  );
}

export function BlogAntdTagApp(
  { data }: { data: BlogTagViewData },
) {
  return (
    <ConfigProvider theme={BLOG_ANTD_THEME}>
      <TagView data={data} />
    </ConfigProvider>
  );
}

export function BlogAntdPostApp(
  { data }: { data: BlogPostViewData },
) {
  return (
    <ConfigProvider theme={BLOG_ANTD_THEME}>
      <PostView data={data} />
    </ConfigProvider>
  );
}

export default function BlogAntdApp({ data }: { data: BlogAppViewData }) {
  return (
    <ConfigProvider theme={BLOG_ANTD_THEME}>
      <BlogAntdContent data={data} />
    </ConfigProvider>
  );
}
