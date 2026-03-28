/** @jsxImportSource react */
import type { BlogArchiveViewData, BlogStoryCard } from "../view-data.ts";
import { BLOG_ANTD_THEME } from "./theme.ts";
import {
  Anchor,
  BackTop,
  Button,
  Card,
  ConfigProvider,
  Flex,
  Paragraph,
  ReadOutlined,
  ScheduleOutlined,
  Tag,
  Timeline,
  Title,
  VerticalAlignTopOutlined,
} from "@blog/archive-antd";
import { formatIndex, StoryTags } from "./common.tsx";

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

function ArchiveMonthNav(
  { months, label }: { months: readonly ArchiveMonthGroup[]; label: string },
) {
  const newestMonth = months[0];
  const oldestMonth = months[months.length - 1];

  if (!newestMonth || !oldestMonth) {
    return null;
  }

  const yearGroups = new Map<number, ArchiveMonthGroup[]>();

  for (const month of months) {
    const existingYear = yearGroups.get(month.year) ?? [];
    existingYear.push(month);
    yearGroups.set(month.year, existingYear);
  }

  return (
    <aside className="blog-antd-archive-nav" aria-label={label}>
      <div className="blog-antd-archive-nav__intro">
        <p className="blog-antd-eyebrow">{label}</p>
        <Paragraph className="blog-antd-archive-nav__range">
          {oldestMonth.label} - {newestMonth.label}
        </Paragraph>
      </div>
      <div className="blog-antd-archive-month-groups">
        {Array.from(yearGroups, ([year, yearMonths]) => (
          <section
            key={year}
            className="blog-antd-archive-month-group"
            aria-labelledby={`archive-year-${year}`}
          >
            <p
              id={`archive-year-${year}`}
              className="blog-antd-archive-month-group__year"
            >
              {year}
            </p>
            <Anchor
              affix={false}
              className="blog-antd-archive-anchor"
              direction="horizontal"
              replace
              targetOffset={112}
              items={yearMonths.map((month) => ({
                key: month.key,
                href: `#${month.anchorId}`,
                title: (
                  <span
                    className="blog-antd-archive-anchor__title"
                    title={`${month.label} • ${
                      formatIndex(month.posts.length)
                    }`}
                  >
                    <span className="blog-antd-archive-anchor__label">
                      {month.shortLabel}
                    </span>
                    <span className="blog-antd-archive-anchor__count">
                      {formatIndex(month.posts.length)}
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
                <ArchiveMonthNav
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

export function BlogAntdArchiveApp(
  { data }: { data: BlogArchiveViewData },
) {
  return (
    <ConfigProvider theme={BLOG_ANTD_THEME}>
      <ArchiveView data={data} />
    </ConfigProvider>
  );
}
