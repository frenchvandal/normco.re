/** @jsxImportSource npm/react */
import { createRoot } from "npm/react-dom/client";

import { Masonry } from "@blog/gallery-antd";
import {
  GALLERY_DATA_SCRIPT_ID,
  GALLERY_ROOT_ID,
} from "../../gallery/constants.ts";
import type {
  BlogGalleryItem,
  BlogGalleryViewData,
} from "../../gallery/view-data.ts";
import {
  PRETEXT_GALLERY_CARD_SUMMARY_CLASS,
  PRETEXT_GALLERY_CARD_SUMMARY_SELECTOR,
  PRETEXT_GALLERY_CARD_TITLE_CLASS,
  PRETEXT_GALLERY_CARD_TITLE_SELECTOR,
} from "./pretext-selectors.ts";
import { usePretextTextStyle } from "./pretext-story.ts";

type GalleryRuntimeItem = Readonly<
  BlogGalleryItem & {
    mediaHtml?: string | undefined;
  }
>;

type GalleryRuntimeData = Readonly<
  Omit<BlogGalleryViewData, "items"> & {
    items: readonly GalleryRuntimeItem[];
  }
>;

function GalleryCardMeta({ item }: { item: GalleryRuntimeItem }) {
  return (
    <p className="blog-antd-gallery-card__meta">
      <time dateTime={item.postDateIso}>{item.postDateLabel}</time>
      {item.postReadingLabel && (
        <>
          <span aria-hidden="true">·</span>
          <span>{item.postReadingLabel}</span>
        </>
      )}
    </p>
  );
}

function GalleryCardMedia({ item, openPostLabel }: {
  item: GalleryRuntimeItem;
  openPostLabel: string;
}) {
  if (item.mediaHtml) {
    return (
      <a
        href={item.postUrl}
        className="blog-antd-gallery-card__media-link"
        aria-label={`${openPostLabel}: ${item.postTitle}`}
        dangerouslySetInnerHTML={{ __html: item.mediaHtml }}
      />
    );
  }

  return (
    <a
      href={item.postUrl}
      className="blog-antd-gallery-card__media-link"
      aria-label={`${openPostLabel}: ${item.postTitle}`}
    >
      <img
        className="blog-antd-gallery-card__image"
        src={item.src}
        alt={item.alt}
        width={item.width}
        height={item.height}
        loading="lazy"
        decoding="async"
      />
    </a>
  );
}

function GalleryCard(
  {
    item,
    openPostLabel,
  }: {
    item: GalleryRuntimeItem;
    openPostLabel: string;
  },
) {
  const measuredText = usePretextTextStyle({
    summary: item.postSummary,
    summarySelector: PRETEXT_GALLERY_CARD_SUMMARY_SELECTOR,
    title: item.postTitle,
    titleSelector: PRETEXT_GALLERY_CARD_TITLE_SELECTOR,
  });

  return (
    <article
      ref={measuredText.ref}
      className="blog-antd-gallery-card"
      style={measuredText.style}
    >
      <GalleryCardMedia item={item} openPostLabel={openPostLabel} />
      <div className="blog-antd-gallery-card__copy">
        <h2 className={PRETEXT_GALLERY_CARD_TITLE_CLASS}>
          <a href={item.postUrl}>{item.postTitle}</a>
        </h2>
        {item.postSummary && (
          <p className={PRETEXT_GALLERY_CARD_SUMMARY_CLASS}>
            {item.postSummary}
          </p>
        )}
        <GalleryCardMeta item={item} />
      </div>
    </article>
  );
}

export function GalleryApp({ data }: { data: GalleryRuntimeData }) {
  return (
    <div
      className="blog-antd-gallery-surface"
      aria-label={data.imagesAriaLabel}
    >
      <Masonry
        columns={{ xs: 1, sm: 2, md: 3 }}
        gutter={{ xs: 16, sm: 20, md: 24 }}
        fresh
        classNames={{
          root: "blog-antd-gallery-masonry",
          item: "blog-antd-gallery-masonry__item",
        }}
        items={data.items.map((item) => ({
          key: item.key,
          data: item,
        }))}
        itemRender={(itemInfo) => (
          <GalleryCard
            item={itemInfo.data}
            openPostLabel={data.openPostLabel}
          />
        )}
      />
    </div>
  );
}

function parseGalleryViewData(
  value: string,
): GalleryRuntimeData | undefined {
  try {
    return JSON.parse(value) as GalleryRuntimeData;
  } catch {
    return undefined;
  }
}

function resolveStaticMediaHtml(
  rootElement: HTMLElement,
  itemKey: string,
): string | undefined {
  const article = rootElement.querySelector<HTMLElement>(
    `[data-gallery-item-key="${CSS.escape(itemKey)}"]`,
  );
  const link = article?.querySelector<HTMLElement>(
    ".blog-antd-gallery-card__media-link",
  );
  const mediaHtml = link?.innerHTML.trim();

  return mediaHtml ? mediaHtml : undefined;
}

function mergeStaticMediaHtml(
  rootElement: HTMLElement,
  data: GalleryRuntimeData,
): GalleryRuntimeData {
  return {
    ...data,
    items: data.items.map((item) => ({
      ...item,
      mediaHtml: resolveStaticMediaHtml(rootElement, item.key) ??
        item.mediaHtml,
    })),
  };
}

export function mountGalleryApp(rootElement: HTMLElement): void {
  const dataElement = document.getElementById(GALLERY_DATA_SCRIPT_ID);

  if (!(dataElement instanceof HTMLScriptElement)) {
    return;
  }

  const data = parseGalleryViewData(dataElement.textContent ?? "");

  if (data === undefined) {
    return;
  }

  createRoot(rootElement).render(
    <GalleryApp data={mergeStaticMediaHtml(rootElement, data)} />,
  );
}

export function startGalleryApp(): void {
  const rootElement = document.getElementById(GALLERY_ROOT_ID);

  if (!(rootElement instanceof HTMLElement)) {
    return;
  }

  mountGalleryApp(rootElement);
}
