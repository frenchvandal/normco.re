export type BlogOutlineItem = Readonly<{
  id: string;
  level: 2 | 3;
  text: string;
}>;

export type BlogStoryCard = Readonly<{
  title: string;
  url: string;
  dateIso: string;
  dateLabel: string;
  summary?: string;
  readingLabel?: string;
  tags?: readonly string[];
}>;

export type BlogBreadcrumbItem = Readonly<{
  href: string;
  label: string;
}>;

export type BlogMetaItem = Readonly<{
  key: string;
  label: string;
  valueHtml: string;
}>;

export type BlogSummaryItem = Readonly<{
  key: string;
  label: string;
  value: string | number;
}>;

export type BlogLinkItem = Readonly<{
  title: string;
  url: string;
}>;

export type BlogTagItem = Readonly<{
  label: string;
  title: string;
  url: string;
}>;

export type BlogArchiveViewData = Readonly<{
  view: "archive";
  title: string;
  lead: string;
  postsCountLabel: string;
  postsAriaLabel: string;
  posts: readonly BlogStoryCard[];
  emptyStateTitle: string;
  emptyStateMessage: string;
  emptyStateActionHref: string;
  emptyStateActionLabel: string;
}>;

export type BlogTagViewData = Readonly<{
  view: "tag";
  breadcrumbAriaLabel: string;
  breadcrumb: readonly BlogBreadcrumbItem[];
  eyebrow: string;
  title: string;
  postsCountLabel: string;
  postsAriaLabel: string;
  archiveUrl: string;
  archiveLinkLabel: string;
  posts: readonly BlogStoryCard[];
  emptyStateMessage: string;
}>;

export type BlogPostViewData = Readonly<{
  view: "post";
  languageTag: string;
  breadcrumbAriaLabel: string;
  breadcrumb: readonly BlogBreadcrumbItem[];
  title: string;
  publishedDateIso: string;
  publishedDateLabel: string;
  readingTimeLabel?: string;
  summaryEyebrow: string;
  summary?: string;
  summaryItems: readonly BlogSummaryItem[];
  contentHtml: string;
  detailsTitle: string;
  publicationDetails: readonly BlogMetaItem[];
  railAriaLabel: string;
  sectionsTitle: string;
  outline: readonly BlogOutlineItem[];
  tagsTitle: string;
  tags: readonly BlogTagItem[];
  backlinksTitle: string;
  backlinks: readonly BlogLinkItem[];
  navigationAriaLabel: string;
  previousLabel: string;
  nextLabel: string;
  previous?: BlogLinkItem;
  next?: BlogLinkItem;
  codeCopyLabel?: string;
  codeCopyFeedback?: string;
  codeCopyFailedFeedback?: string;
}>;

export type BlogAppViewData =
  | BlogArchiveViewData
  | BlogTagViewData
  | BlogPostViewData;
