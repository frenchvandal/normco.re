/** @jsxImportSource react */
import type { BlogPostViewData } from "../view-data.ts";
import { BLOG_ANTD_THEME } from "./theme.ts";
import {
  BackTop,
  BarChartOutlined,
  Breadcrumb,
  Card,
  Col,
  ConfigProvider,
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
import { getBlogTagColor } from "./tag-colors.ts";
import { MetaLine, renderBreadcrumbItems } from "./common.tsx";

export function PostView(
  { data, interactive = true }: {
    data: BlogPostViewData;
    interactive?: boolean | undefined;
  },
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
                        variant="outlined"
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
                      <a
                        className="ant-btn ant-btn-default"
                        href={data.previous.url}
                      >
                        {data.previousLabel}: {data.previous.title}
                      </a>
                    )}
                    {data.next && (
                      <a
                        className="ant-btn ant-btn-primary"
                        href={data.next.url}
                      >
                        {data.nextLabel}: {data.next.title}
                      </a>
                    )}
                  </Space>
                </Card>
              )}
            </div>
          </aside>
        )}
      </div>
      {interactive && (
        <BackTop
          visibilityHeight={320}
          icon={<VerticalAlignTopOutlined />}
        />
      )}
    </div>
  );
}

export function BlogAntdPostApp(
  { data, interactive = true }: {
    data: BlogPostViewData;
    interactive?: boolean | undefined;
  },
) {
  return (
    <ConfigProvider theme={BLOG_ANTD_THEME}>
      <PostView data={data} interactive={interactive} />
    </ConfigProvider>
  );
}
