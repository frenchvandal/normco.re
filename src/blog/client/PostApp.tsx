/** @jsxImportSource npm/react */
import { useMemo } from "npm/react";

import {
  BackTop,
  BarChartOutlined,
  Breadcrumb,
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  FileTextOutlined,
  Flex,
  NodeIndexOutlined,
  Paragraph,
  ProfileOutlined,
  Row,
  Space,
  Statistic,
  SwapOutlined,
  Tag,
  TagsOutlined,
  Timeline,
  Title,
  VerticalAlignTopOutlined,
} from "@blog/post-antd";

import type { BlogPostViewData } from "../view-data.ts";
import {
  BLOG_ANTD_BACKTOP_CLASSNAMES,
  BLOG_ANTD_BREADCRUMB_CLASSNAMES,
  BLOG_ANTD_CARD_CLASSNAMES,
  BLOG_ANTD_DEFAULT_BUTTON_ROOT,
  BLOG_ANTD_DESCRIPTIONS_CLASSNAMES,
  BLOG_ANTD_METRIC_CARD_CLASSNAMES,
  BLOG_ANTD_OUTLINE_TIMELINE_CLASSNAMES,
  BLOG_ANTD_PRIMARY_BUTTON_ROOT,
  BLOG_ANTD_RAIL_CARD_CLASSNAMES,
  BLOG_ANTD_STATISTIC_CLASSNAMES,
} from "./antd-semantic.ts";
import {
  BLOG_ANTD_ROW_GUTTER_SECTION,
  BLOG_ANTD_SPACE_3,
  BLOG_ANTD_SPACE_4,
} from "./spacing.ts";
import {
  MetaLine,
  renderBreadcrumbItems,
  TrustedHtmlSection,
  TrustedHtmlSpan,
} from "./common.tsx";
import {
  PRETEXT_OUTLINE_LINK_TEXT_CLASS,
  PRETEXT_OUTLINE_LINK_TEXT_SELECTOR,
} from "./pretext-selectors.ts";
import { usePretextTextStyle } from "./pretext-story.ts";

const OUTLINE_TIMELINE_COLORS = {
  primary: "var(--ph-color-accent-fg)",
  secondary: "var(--ph-color-fg-muted)",
} as const;

export function OutlineTimelineLink(
  { id, text }: {
    id: string;
    text: string;
  },
) {
  const measuredText = usePretextTextStyle({
    title: text,
    titleSelector: PRETEXT_OUTLINE_LINK_TEXT_SELECTOR,
  });

  return (
    <a
      ref={measuredText.ref}
      href={`#${id}`}
      className="blog-antd-outline-link"
      style={measuredText.style}
    >
      <span className={PRETEXT_OUTLINE_LINK_TEXT_CLASS}>{text}</span>
    </a>
  );
}

export function PostView(
  { data, interactive = true }: {
    data: BlogPostViewData;
    interactive?: boolean | undefined;
  },
) {
  const hasRail = data.outline.length > 0 || data.tags.length > 0 ||
    data.backlinks.length > 0 || data.previous || data.next;
  const breadcrumbItems = useMemo(
    () => renderBreadcrumbItems(data.breadcrumb),
    [data.breadcrumb],
  );
  const publicationDetailItems = useMemo(
    () =>
      data.publicationDetails.map((item) => ({
        key: item.key,
        label: item.label,
        children: <TrustedHtmlSpan html={item.valueHtml} />,
      })),
    [data.publicationDetails],
  );
  const outlineItems = useMemo(() =>
    data.outline.map((item) => ({
      color: item.level === 2
        ? OUTLINE_TIMELINE_COLORS.primary
        : OUTLINE_TIMELINE_COLORS.secondary,
      content: <OutlineTimelineLink id={item.id} text={item.text} />,
    })), [data.outline]);

  return (
    <>
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
                rootClassName="blog-antd-breadcrumb"
                classNames={BLOG_ANTD_BREADCRUMB_CLASSNAMES}
                items={breadcrumbItems}
              />
            </nav>

            <section className="blog-antd-hero blog-antd-hero--post">
              <Row gutter={BLOG_ANTD_ROW_GUTTER_SECTION} align="top">
                <Col xs={24} xl={15}>
                  <Flex
                    vertical
                    gap={BLOG_ANTD_SPACE_4}
                    className="blog-antd-post-header__copy"
                  >
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
                      dateTooltip={data.dateTooltip}
                      readingTooltip={data.readingTooltip}
                    />
                    {data.summaryItems.length > 0 && (
                      <div className="blog-antd-post-metrics">
                        {data.summaryItems.map((item) => (
                          <Card
                            key={item.key}
                            rootClassName="blog-antd-card blog-antd-post-metric-card"
                            classNames={BLOG_ANTD_METRIC_CARD_CLASSNAMES}
                            variant="borderless"
                          >
                            <Statistic
                              classNames={BLOG_ANTD_STATISTIC_CLASSNAMES}
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
                {data.summary && (
                  <Col xs={24} xl={9}>
                    <div className="blog-antd-post-summary blog-antd-post-summary--hero">
                      <p className="blog-antd-eyebrow">
                        {data.summaryEyebrow}
                      </p>
                      <Paragraph className="blog-antd-page-lead blog-antd-page-lead--summary">
                        {data.summary}
                      </Paragraph>
                    </div>
                  </Col>
                )}
              </Row>
            </section>

            <Divider className="blog-antd-section-divider" />

            <TrustedHtmlSection
              className="post-content"
              lang={data.languageTag}
              ariaLabelledby="post-title"
              html={data.contentHtml}
            />

            <Card
              rootClassName="blog-antd-card blog-antd-details-card"
              classNames={BLOG_ANTD_CARD_CLASSNAMES}
              variant="borderless"
            >
              <Flex
                align="center"
                gap={BLOG_ANTD_SPACE_3}
                className="blog-antd-rail-head"
              >
                <FileTextOutlined />
                <Title level={4} className="blog-antd-rail-title">
                  {data.detailsTitle}
                </Title>
              </Flex>
              <Descriptions
                column={1}
                classNames={BLOG_ANTD_DESCRIPTIONS_CLASSNAMES}
                items={publicationDetailItems}
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
                  <Card
                    rootClassName="blog-antd-card blog-antd-rail-card"
                    classNames={BLOG_ANTD_RAIL_CARD_CLASSNAMES}
                    variant="borderless"
                  >
                    <Flex
                      align="center"
                      gap={BLOG_ANTD_SPACE_3}
                      className="blog-antd-rail-head"
                    >
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
                      classNames={BLOG_ANTD_OUTLINE_TIMELINE_CLASSNAMES}
                      items={outlineItems}
                    />
                  </Card>
                )}

                {data.tags.length > 0 && (
                  <Card
                    rootClassName="blog-antd-card blog-antd-rail-card"
                    classNames={BLOG_ANTD_RAIL_CARD_CLASSNAMES}
                    variant="borderless"
                  >
                    <Flex
                      align="center"
                      gap={BLOG_ANTD_SPACE_3}
                      className="blog-antd-rail-head"
                    >
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
                        <Tag key={tag.url} className="blog-antd-tag">
                          <a href={tag.url} title={tag.title} rel="tag">
                            {tag.label}
                          </a>
                        </Tag>
                      ))}
                    </Space>
                  </Card>
                )}

                {data.backlinks.length > 0 && (
                  <Card
                    rootClassName="blog-antd-card blog-antd-rail-card"
                    classNames={BLOG_ANTD_RAIL_CARD_CLASSNAMES}
                    variant="borderless"
                  >
                    <Flex
                      align="center"
                      gap={BLOG_ANTD_SPACE_3}
                      className="blog-antd-rail-head"
                    >
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
                  <Card
                    rootClassName="blog-antd-card blog-antd-rail-card"
                    classNames={BLOG_ANTD_RAIL_CARD_CLASSNAMES}
                    variant="borderless"
                  >
                    <Flex
                      align="center"
                      gap={BLOG_ANTD_SPACE_3}
                      className="blog-antd-rail-head"
                    >
                      <SwapOutlined />
                      <Title
                        level={4}
                        className="blog-antd-rail-title"
                      >
                        {data.navigationAriaLabel}
                      </Title>
                    </Flex>
                    <div className="blog-antd-nav-stack">
                      {data.previous && (
                        <Button
                          href={data.previous.url}
                          block
                          rootClassName={`${BLOG_ANTD_DEFAULT_BUTTON_ROOT} blog-antd-nav-button`}
                          type="default"
                        >
                          {data.previousLabel}: {data.previous.title}
                        </Button>
                      )}
                      {data.next && (
                        <Button
                          href={data.next.url}
                          block
                          rootClassName={`${BLOG_ANTD_PRIMARY_BUTTON_ROOT} blog-antd-nav-button`}
                          type="primary"
                        >
                          {data.nextLabel}: {data.next.title}
                        </Button>
                      )}
                    </div>
                  </Card>
                )}
              </div>
            </aside>
          )}
        </div>
      </div>
      {interactive && (
        <BackTop
          visibilityHeight={320}
          rootClassName="blog-antd-backtop"
          classNames={BLOG_ANTD_BACKTOP_CLASSNAMES}
          icon={<VerticalAlignTopOutlined />}
        />
      )}
    </>
  );
}
