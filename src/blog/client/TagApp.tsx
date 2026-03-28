/** @jsxImportSource react */
import type { BlogTagViewData } from "../view-data.ts";
import { BLOG_ANTD_THEME } from "./theme.ts";
import {
  BackTop,
  Breadcrumb,
  Button,
  Card,
  Col,
  ConfigProvider,
  Empty,
  Flex,
  Paragraph,
  Row,
  Tag,
  Title,
  VerticalAlignTopOutlined,
} from "@blog/tag-antd";
import {
  FeaturedStory,
  HeroLatestLink,
  renderBreadcrumbItems,
  StoryGrid,
} from "./common.tsx";

function TagView(
  { data, interactive = true }: {
    data: BlogTagViewData;
    interactive?: boolean | undefined;
  },
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
      {interactive && (
        <BackTop
          visibilityHeight={280}
          icon={<VerticalAlignTopOutlined />}
        />
      )}
    </div>
  );
}

export function BlogAntdTagApp(
  { data, interactive = true }: {
    data: BlogTagViewData;
    interactive?: boolean | undefined;
  },
) {
  return (
    <ConfigProvider theme={BLOG_ANTD_THEME}>
      <TagView data={data} interactive={interactive} />
    </ConfigProvider>
  );
}
