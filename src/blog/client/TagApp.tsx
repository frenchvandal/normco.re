/** @jsxImportSource npm/react */
import { useMemo } from "npm/react";

import {
  BackTop,
  Breadcrumb,
  Button,
  Card,
  Col,
  Empty,
  Flex,
  Paragraph,
  Row,
  Tag,
  Title,
  VerticalAlignTopOutlined,
} from "@blog/tag-antd";

import type { BlogTagViewData } from "../view-data.ts";
import { resolveTagStorySections } from "../tag-layout.ts";
import {
  BLOG_ANTD_BACKTOP_CLASSNAMES,
  BLOG_ANTD_BREADCRUMB_CLASSNAMES,
  BLOG_ANTD_CARD_CLASSNAMES,
  BLOG_ANTD_PRIMARY_BUTTON_ROOT,
} from "./antd-semantic.ts";
import { BLOG_ANTD_ROW_GUTTER_SECTION, BLOG_ANTD_SPACE_4 } from "./spacing.ts";
import {
  FeaturedStory,
  HeroLatestLink,
  renderBreadcrumbItems,
  StoryGrid,
} from "./common.tsx";

export function TagView(
  { data, interactive = true }: {
    data: BlogTagViewData;
    interactive?: boolean | undefined;
  },
) {
  const {
    featuredStory,
    latestStory,
    secondaryStories,
    gridStories,
    gridStartIndex,
  } = resolveTagStorySections(data.posts);
  const breadcrumbItems = useMemo(
    () => renderBreadcrumbItems(data.breadcrumb),
    [data.breadcrumb],
  );

  return (
    <>
      <div className="site-page-shell site-page-shell--editorial blog-antd-page blog-antd-page--tag">
        <div className="blog-antd-stack">
          <nav aria-label={data.breadcrumbAriaLabel}>
            <Breadcrumb
              rootClassName="blog-antd-breadcrumb"
              classNames={BLOG_ANTD_BREADCRUMB_CLASSNAMES}
              items={breadcrumbItems}
            />
          </nav>

          <section className="blog-antd-hero blog-antd-hero--tag">
            <Row gutter={BLOG_ANTD_ROW_GUTTER_SECTION} align="middle">
              <Col xs={24} lg={16}>
                <Flex
                  vertical
                  gap={BLOG_ANTD_SPACE_4}
                  className="blog-antd-hero__copy"
                >
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
                  gap={BLOG_ANTD_SPACE_4}
                  className="blog-antd-hero-note blog-antd-hero-note--tag"
                >
                  <Tag className="blog-antd-count-tag blog-antd-count-tag--soft">
                    {data.title}
                  </Tag>
                  <Button
                    type="primary"
                    href={data.archiveUrl}
                    rootClassName={BLOG_ANTD_PRIMARY_BUTTON_ROOT}
                  >
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
                    secondaryStories={secondaryStories}
                    title={data.postsCountLabel}
                  />
                )}
                {gridStories.length > 0 && (
                  <StoryGrid
                    posts={gridStories}
                    ariaLabel={data.postsAriaLabel}
                    startIndex={gridStartIndex}
                  />
                )}
              </>
            )
            : (
              <Card
                rootClassName="blog-antd-card blog-antd-empty-card"
                classNames={BLOG_ANTD_CARD_CLASSNAMES}
                variant="borderless"
              >
                <Empty
                  className="blog-antd-empty"
                  description={
                    <span className="blog-antd-empty__description">
                      {data.emptyStateMessage}
                    </span>
                  }
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                >
                  <div className="blog-antd-empty-card__actions">
                    <Button
                      type="primary"
                      href={data.archiveUrl}
                      rootClassName={BLOG_ANTD_PRIMARY_BUTTON_ROOT}
                    >
                      {data.archiveLinkLabel}
                    </Button>
                  </div>
                </Empty>
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
