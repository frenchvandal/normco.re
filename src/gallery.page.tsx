import StatePanel from "./_components/StatePanel.tsx";
import {
  GALLERY_DATA_SCRIPT_ID,
  GALLERY_RESPONSIVE_IMAGE_SIZES,
  GALLERY_RESPONSIVE_IMAGE_TRANSFORMS,
  GALLERY_ROOT_ID,
} from "./gallery/constants.ts";
import { formatArchiveIndex } from "./blog/archive-common.ts";
import { collectGalleryItems } from "./gallery/data.ts";
import { resolvePageSetup } from "./utils/page-setup.ts";
import { resolveDateHelper } from "./utils/lume-helpers.ts";
import { searchPages } from "./utils/lume-data.ts";
import { escapeHtml } from "./utils/html.ts";

export const lang = ["en", "fr", "zh-hans", "zh-hant"] as const;
export const url = "/gallery/";
export const layout = "layouts/base.tsx";
export const extraStylesheets = ["/styles/blog-antd.css"];
export const searchIndexed = false;
export const type = "listing";
export const title = "Image Index";
export const description =
  "A visual index of every image published across the posts.";

export const fr = {
  title: "Index visuel",
  description:
    "Un index visuel rassemblant toutes les images publiées dans les articles.",
} as const;

export const zhHans = {
  title: "图像索引",
  description: "汇集所有文章图片的可视化归档页面。",
} as const;

export const zhHant = {
  title: "圖像索引",
  description: "彙整所有文章圖片的視覺檔案頁。",
} as const;

function formatGalleryCountLabel(
  count: number,
  {
    countOneLabel,
    countManyLabel,
  }: {
    countOneLabel: string;
    countManyLabel: string;
  },
): string {
  const template = count === 1 ? countOneLabel : countManyLabel;
  return template.replace("[COUNT]", String(count));
}

function serializeJsonForScript(value: unknown): string {
  return JSON.stringify(value)
    .replaceAll("<", "\\u003c")
    .replaceAll("-->", "--\\>");
}

function renderGalleryFallback(
  items: Awaited<ReturnType<typeof collectGalleryItems>>,
  openPostLabel: string,
): string {
  const responsiveImageSizes = escapeHtml(GALLERY_RESPONSIVE_IMAGE_SIZES);
  const responsiveImageTransforms = escapeHtml(
    GALLERY_RESPONSIVE_IMAGE_TRANSFORMS,
  );

  return `<ul class="blog-antd-gallery-fallback">${
    items.map((item, index) => (
      `<li
    class="blog-antd-gallery-fallback__item"
    data-gallery-item-key="${escapeHtml(item.key)}"
  >
    <article class="blog-antd-gallery-card">
      <a
        href="${escapeHtml(item.postUrl)}"
        class="blog-antd-gallery-card__media-link"
        aria-label="${escapeHtml(`${openPostLabel}: ${item.postTitle}`)}"
      >
        <img
          class="blog-antd-gallery-card__image"
          src="${escapeHtml(item.src)}"
          alt="${escapeHtml(item.alt)}"
          width="${item.width}"
          height="${item.height}"
          loading="lazy"
          decoding="async"
          sizes="${responsiveImageSizes}"
          transform-images="${responsiveImageTransforms}"
        />
      </a>
      <div class="blog-antd-gallery-card__copy">
        <div class="blog-antd-gallery-card__eyebrow">
          <span class="blog-antd-gallery-card__index" aria-hidden="true">${
        formatArchiveIndex(index + 1)
      }</span>
          <p class="blog-antd-gallery-card__meta">
            <time datetime="${escapeHtml(item.postDateIso)}">${
        escapeHtml(item.postDateLabel)
      }</time>${
        item.postReadingLabel
          ? `<span aria-hidden="true">·</span><span>${
            escapeHtml(item.postReadingLabel)
          }</span>`
          : ""
      }
          </p>
        </div>
        <h2 class="blog-antd-gallery-card__title">
          <a href="${escapeHtml(item.postUrl)}">${
        escapeHtml(item.postTitle)
      }</a>
        </h2>${
        item.postSummary
          ? `<p class="blog-antd-gallery-card__summary">${
            escapeHtml(item.postSummary)
          }</p>`
          : ""
      }
      </div>
    </article>
  </li>`
    )).join("")
  }</ul>`;
}

export default async (
  data: Lume.Data,
  helpers: Lume.Helpers,
): Promise<string> => {
  const dateFormat = resolveDateHelper(helpers);
  const { archiveUrl, language, languageDataCode, translations: t } =
    resolvePageSetup(data.lang);
  const posts = searchPages(
    data.search,
    `type=post lang=${languageDataCode}`,
  );
  const items = await collectGalleryItems(posts, language, dateFormat);
  const countLabel = formatGalleryCountLabel(items.length, {
    countOneLabel: t.gallery.countOneLabel,
    countManyLabel: t.gallery.countManyLabel,
  });

  const galleryPayload = {
    view: "gallery" as const,
    title: t.gallery.title,
    lead: t.gallery.lead,
    countLabel,
    archiveUrl,
    archiveLinkLabel: t.gallery.archiveLinkLabel,
    imagesAriaLabel: t.gallery.imagesAriaLabel,
    openPostLabel: t.gallery.openPostLabel,
    items,
  };

  return `<div class="blog-antd-root">
  <div class="site-page-shell site-page-shell--wide blog-antd-page blog-antd-page--gallery">
    <div class="blog-antd-stack">
      <section class="blog-antd-gallery-hero" aria-labelledby="gallery-title">
        <div class="blog-antd-hero__copy blog-antd-gallery-hero__copy">
          <span class="blog-antd-count-tag">${escapeHtml(countLabel)}</span>
          <h1 id="gallery-title" class="blog-antd-page-title">${
    escapeHtml(t.gallery.title)
  }</h1>
          <p class="blog-antd-page-lead">${escapeHtml(t.gallery.lead)}</p>
          <div class="blog-antd-gallery-hero__actions">
            <a class="blog-antd-archive-nav__latest" href="${
    escapeHtml(archiveUrl)
  }">${escapeHtml(t.gallery.archiveLinkLabel)}</a>
          </div>
        </div>
      </section>
      ${
    items.length === 0
      ? StatePanel({
        title: t.gallery.emptyStateTitle,
        message: t.gallery.emptyStateMessage,
        actionHref: archiveUrl,
        actionLabel: t.navigation.writing,
        headingTag: "h2",
        variant: "inline",
      })
      : `<section class="blog-antd-gallery-section" aria-label="${
        escapeHtml(t.gallery.imagesAriaLabel)
      }">
          <div id="${GALLERY_ROOT_ID}" class="blog-antd-gallery-root">${
        renderGalleryFallback(items, t.gallery.openPostLabel)
      }</div>
          <script id="${GALLERY_DATA_SCRIPT_ID}" type="application/json">${
        serializeJsonForScript(galleryPayload)
      }</script>
          <script src="/scripts/gallery.js" type="module" defer="defer"></script>
        </section>`
  }
    </div>
  </div>
</div>`;
};
