export type BlogGalleryItem = Readonly<{
  key: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  mediaHtml?: string | undefined;
  postTitle: string;
  postUrl: string;
  postSummary?: string | undefined;
  postDateIso: string;
  postDateLabel: string;
  postReadingLabel?: string | undefined;
  tags: readonly string[];
}>;

export type BlogGalleryViewData = Readonly<{
  view: "gallery";
  title: string;
  lead: string;
  countLabel: string;
  archiveUrl: string;
  archiveLinkLabel: string;
  imagesAriaLabel: string;
  openPostLabel: string;
  items: readonly BlogGalleryItem[];
}>;
