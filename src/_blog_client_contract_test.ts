import { assertMatch, assertStringIncludes } from "@std/assert";
import { describe, it } from "@std/testing/bdd";

const commonSource = Deno.readTextFileSync(
  new URL("./blog/client/common.tsx", import.meta.url),
);
const blogAntdStyles = Deno.readTextFileSync(
  new URL("./styles/blog-antd.css", import.meta.url),
);
const generatedAntdStyles = Deno.readTextFileSync(
  new URL("./styles/generated/antd-components.css", import.meta.url),
);
const postAntdSource = Deno.readTextFileSync(
  new URL("./blog/client/post-antd.ts", import.meta.url),
);
const postAntdBuild = Deno.readTextFileSync(
  new URL("./blog/client/post-antd.build.ts", import.meta.url),
);
const archiveAntdSource = Deno.readTextFileSync(
  new URL("./blog/client/archive-antd.ts", import.meta.url),
);
const archiveAntdBuild = Deno.readTextFileSync(
  new URL("./blog/client/archive-antd.build.ts", import.meta.url),
);
const galleryAntdSource = Deno.readTextFileSync(
  new URL("./blog/client/gallery-antd.ts", import.meta.url),
);
const galleryAntdBuild = Deno.readTextFileSync(
  new URL("./blog/client/gallery-antd.build.ts", import.meta.url),
);
const postAppSource = Deno.readTextFileSync(
  new URL("./blog/client/PostApp.tsx", import.meta.url),
);
const archiveAppSource = Deno.readTextFileSync(
  new URL("./blog/client/ArchiveApp.tsx", import.meta.url),
);
const galleryAppSource = Deno.readTextFileSync(
  new URL("./blog/client/GalleryApp.tsx", import.meta.url),
);
const pretextStoryCoreSource = Deno.readTextFileSync(
  new URL("./blog/client/pretext-story-core.ts", import.meta.url),
);
const pretextSelectorsSource = Deno.readTextFileSync(
  new URL("./blog/client/pretext-selectors.ts", import.meta.url),
);
const tagAppSource = Deno.readTextFileSync(
  new URL("./blog/client/TagApp.tsx", import.meta.url),
);

describe("blog client interaction contracts", () => {
  it("uses full-card links for story and featured cards", () => {
    assertStringIncludes(
      commonSource,
      'className="blog-antd-story-card__link"',
    );
    assertStringIncludes(
      commonSource,
      'className="blog-antd-feature-card__link"',
    );
    assertStringIncludes(commonSource, "const hasSecondaryStories");
    assertStringIncludes(commonSource, "usePretextTextStyle");
  });

  it("keeps the direct-link card styling wired in CSS", () => {
    assertStringIncludes(blogAntdStyles, ".blog-antd-feature-card__link,");
    assertStringIncludes(blogAntdStyles, ".blog-antd-story-card__link {");
    assertStringIncludes(blogAntdStyles, ".blog-antd-story-card:focus-within");
  });

  it("keeps the post Ant Design build alias aligned with its source exports", () => {
    assertStringIncludes(postAntdSource, "Breadcrumb,\n  Button,");
    assertStringIncludes(postAntdBuild, "Breadcrumb,\n  Button,");
    assertStringIncludes(postAntdBuild, "import Button");
  });

  it("routes trusted post HTML through named helpers instead of inline sinks", () => {
    assertStringIncludes(commonSource, "export function TrustedHtmlSection(");
    assertStringIncludes(commonSource, "export function TrustedHtmlSpan(");
    assertStringIncludes(commonSource, "export function TrustedHtmlAnchor(");
    assertStringIncludes(postAppSource, "<TrustedHtmlSection");
    assertStringIncludes(postAppSource, "<TrustedHtmlSpan");
    assertStringIncludes(galleryAppSource, "<TrustedHtmlAnchor");
  });

  it("keeps PostApp outline links stabilized through Pretext helpers", () => {
    assertStringIncludes(postAppSource, "function OutlineTimelineLink(");
    assertStringIncludes(
      postAppSource,
      "titleSelector: PRETEXT_OUTLINE_LINK_TEXT_SELECTOR",
    );
    assertStringIncludes(
      pretextSelectorsSource,
      'PRETEXT_OUTLINE_LINK_TEXT_CLASS = "blog-antd-outline-link__text"',
    );
    assertStringIncludes(blogAntdStyles, ".blog-antd-outline-link__text {");
    assertStringIncludes(
      blogAntdStyles,
      "min-block-size: var(--pretext-title-height, auto);",
    );
  });

  it("keeps archive BackTop optional for non-interactive renders", () => {
    assertStringIncludes(archiveAppSource, "interactive = true");
    assertStringIncludes(archiveAppSource, "{interactive && (");
  });

  it("keeps floating BackTop controls outside the page shell in interactive blog apps", () => {
    assertMatch(
      archiveAppSource,
      /return \(\n\s*<>\n\s*<div className="site-page-shell[\s\S]*<\/div>\n\s*{interactive && \(/,
    );
    assertMatch(
      postAppSource,
      /return \(\n\s*<>\n\s*<div className="site-page-shell[\s\S]*<\/div>\n\s*{interactive && \(/,
    );
    assertMatch(
      tagAppSource,
      /return \(\n\s*<>\n\s*<div className="site-page-shell[\s\S]*<\/div>\n\s*{interactive && \(/,
    );
  });

  it("keeps the archive Ant Design build alias aligned with its source exports", () => {
    assertStringIncludes(archiveAntdSource, "Skeleton,");
    assertStringIncludes(archiveAntdBuild, "Skeleton,");
    assertStringIncludes(archiveAntdBuild, "import Skeleton");
  });

  it("keeps the gallery Ant Design build alias aligned with its source exports", () => {
    assertStringIncludes(
      galleryAntdSource,
      'import { Masonry } from "npm/antd";',
    );
    assertStringIncludes(galleryAntdBuild, "import Masonry");
  });

  it("keeps gallery masonry enhancement gated to multi-column viewports", () => {
    assertStringIncludes(galleryAppSource, "GALLERY_MASONRY_MEDIA_QUERY");
    assertStringIncludes(galleryAppSource, "matchMedia } = globalThis");
    assertStringIncludes(galleryAppSource, "if (!masonryMediaQuery.matches)");
  });

  it("wires Tooltip around meta pills with accessible structure", () => {
    assertStringIncludes(commonSource, "title={dateTooltip}");
    assertStringIncludes(commonSource, "title={readingTooltip}");
    assertStringIncludes(commonSource, 'aria-hidden="true"');
  });

  it("keeps Skeleton loading state available in archive view", () => {
    assertStringIncludes(archiveAppSource, "ArchiveLoadingSkeleton");
    assertStringIncludes(archiveAppSource, "loading = false");
    assertStringIncludes(archiveAppSource, "if (loading)");
  });

  it("propagates dateTooltip and readingTooltip through archive view", () => {
    assertMatch(
      archiveAppSource,
      /function ArchiveTimelineItem\([\s\S]*dateTooltip,\n\s*readingTooltip,[\s\S]*<MetaLine[\s\S]*dateTooltip={dateTooltip}[\s\S]*readingTooltip={readingTooltip}/,
    );
    assertMatch(
      archiveAppSource,
      /function ArchiveTimeline\([\s\S]*dateTooltip,\n\s*readingTooltip,[\s\S]*<ArchiveTimelineItem[\s\S]*dateTooltip={dateTooltip}[\s\S]*readingTooltip={readingTooltip}/,
    );
    assertMatch(
      archiveAppSource,
      /<ArchiveTimeline[\s\S]*dateTooltip={data.dateTooltip}[\s\S]*readingTooltip={data.readingTooltip}/,
    );
  });

  it("keeps tooltip styling wired in CSS", () => {
    assertStringIncludes(blogAntdStyles, ".blog-antd-tooltip");
    assertStringIncludes(
      blogAntdStyles,
      ".blog-antd-tooltip .ant-tooltip-arrow::before",
    );
  });

  it("keeps the generated Ant Design stylesheet inside the shared layout layer", () => {
    assertStringIncludes(generatedAntdStyles, "@layer layout {");
  });

  it("keeps skeleton styling wired in CSS", () => {
    assertStringIncludes(blogAntdStyles, ".blog-antd-skeleton");
    assertStringIncludes(blogAntdStyles, "--skeleton-color");
  });

  it("keeps Pretext-backed text stabilization wired through the blog surfaces", () => {
    assertStringIncludes(commonSource, "style={measuredText.style}");
    assertStringIncludes(
      commonSource,
      "titleSelector: PRETEXT_STORY_CARD_TITLE_SELECTOR",
    );
    assertStringIncludes(
      archiveAppSource,
      "titleSelector: PRETEXT_ARCHIVE_TIMELINE_TITLE_SELECTOR",
    );
    assertStringIncludes(
      pretextSelectorsSource,
      'PRETEXT_STORY_CARD_TITLE_CLASS = "blog-antd-story-card__title"',
    );
    assertStringIncludes(
      pretextSelectorsSource,
      'PRETEXT_ARCHIVE_TIMELINE_TITLE_CLASS =\n  "blog-antd-archive-timeline__title"',
    );
    assertStringIncludes(blogAntdStyles, "--pretext-title-height");
    assertStringIncludes(blogAntdStyles, "--pretext-summary-height");
  });

  it("keeps StoryGrid row balancing wired through shared Pretext helpers", () => {
    assertStringIncludes(commonSource, "useBalancedStoryGridTextStyles");
    assertStringIncludes(commonSource, "measureText={false}");
    assertStringIncludes(
      commonSource,
      "textStyle={balancedTextStyles.styleMap.get(story.url)}",
    );
  });

  it("keeps advanced Pretext line-inspection helpers available in the core", () => {
    assertStringIncludes(
      pretextStoryCoreSource,
      "export function layoutTextBlockWithLines",
    );
    assertStringIncludes(
      pretextStoryCoreSource,
      "export function measureTextBlockWidestLine",
    );
    assertStringIncludes(
      pretextStoryCoreSource,
      "PREPARED_SEGMENT_TEXT_CACHE",
    );
  });

  it("keeps SignalStories title stabilization wired through Pretext", () => {
    assertStringIncludes(commonSource, "function SignalStoryLink(");
    assertStringIncludes(
      commonSource,
      "titleSelector: PRETEXT_SIGNAL_LIST_TITLE_SELECTOR",
    );
    assertStringIncludes(
      pretextSelectorsSource,
      'PRETEXT_SIGNAL_LIST_TITLE_CLASS = "blog-antd-signal-list__title"',
    );
    assertStringIncludes(blogAntdStyles, ".blog-antd-signal-list__title {");
    assertStringIncludes(
      blogAntdStyles,
      "min-block-size: var(--pretext-title-height, auto);",
    );
  });

  it("keeps gallery text stabilization and static media reuse wired in", () => {
    assertStringIncludes(galleryAppSource, "usePretextTextStyle");
    assertStringIncludes(
      galleryAppSource,
      "titleSelector: PRETEXT_GALLERY_CARD_TITLE_SELECTOR",
    );
    assertStringIncludes(galleryAppSource, "mergeStaticMediaHtml");
    assertStringIncludes(galleryAppSource, "TrustedHtmlAnchor");
    assertStringIncludes(
      pretextSelectorsSource,
      'PRETEXT_GALLERY_CARD_TITLE_CLASS = "blog-antd-gallery-card__title"',
    );
    assertStringIncludes(
      pretextSelectorsSource,
      'PRETEXT_GALLERY_CARD_SUMMARY_CLASS =\n  "blog-antd-gallery-card__summary"',
    );
    assertStringIncludes(blogAntdStyles, ".blog-antd-gallery-card__title {");
    assertStringIncludes(blogAntdStyles, ".blog-antd-gallery-fallback {");
  });
});
