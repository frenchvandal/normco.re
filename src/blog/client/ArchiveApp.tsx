import dayjs, { type Dayjs } from "dayjs";
import { useState } from "react";
import type { BlogArchiveViewData, BlogStoryCard } from "../view-data.ts";
import { BLOG_ANTD_THEME } from "./theme.ts";
import {
  BackTop,
  Button,
  Calendar,
  Card,
  ConfigProvider,
  Flex,
  LeftOutlined,
  Paragraph,
  ReadOutlined,
  RightOutlined,
  ScheduleOutlined,
  Tag,
  Timeline,
  Title,
  Tooltip,
  VerticalAlignTopOutlined,
} from "@blog/archive-antd";
import { formatIndex, StoryTags } from "./common.tsx";
import type { CalendarProps } from "@blog/archive-antd";

type ArchiveMonthGroup = Readonly<{
  key: string;
  year: number;
  label: string;
  shortLabel: string;
  anchorId: string;
  posts: readonly BlogStoryCard[];
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
