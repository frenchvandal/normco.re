export const BLOG_ANTD_CARD_CLASSNAMES = {
  body: "blog-antd-card__body",
} as const;

export const BLOG_ANTD_METRIC_CARD_CLASSNAMES = {
  body: "blog-antd-card__body blog-antd-card__body--metric",
} as const;

export const BLOG_ANTD_RAIL_CARD_CLASSNAMES = {
  body: "blog-antd-card__body blog-antd-card__body--rail",
} as const;

export const BLOG_ANTD_STATISTIC_CLASSNAMES = {
  root: "blog-antd-statistic",
  title: "blog-antd-statistic__title",
  content: "blog-antd-statistic__content",
} as const;

export const BLOG_ANTD_DESCRIPTIONS_CLASSNAMES = {
  label: "blog-antd-descriptions__label",
  content: "blog-antd-descriptions__content",
} as const;

export const BLOG_ANTD_BREADCRUMB_CLASSNAMES = {
  item: "blog-antd-breadcrumb__item",
  separator: "blog-antd-breadcrumb__separator",
} as const;

export const BLOG_ANTD_PRIMARY_BUTTON_ROOT =
  "blog-antd-button blog-antd-button--primary";

export const BLOG_ANTD_DEFAULT_BUTTON_ROOT =
  "blog-antd-button blog-antd-button--default";

export const BLOG_ANTD_BACKTOP_CLASSNAMES = {
  root: "blog-antd-backtop__button",
  icon: "blog-antd-backtop__icon",
} as const;

export const BLOG_ANTD_OUTLINE_TIMELINE_CLASSNAMES = {
  itemRail: "blog-antd-outline-timeline__rail",
} as const;

export const BLOG_ANTD_READING_METER_PROGRESS = {
  railColor:
    "color-mix(in oklch, var(--ph-color-canvas-inset) 88%, var(--ph-color-border-muted))",
  strokeColor: {
    "0%": "color-mix(in oklch, var(--ph-color-accent-emphasis) 88%, white)",
    "100%": "var(--ph-color-accent-fg)",
  },
} as const;

export const BLOG_ANTD_SKELETON_CLASSNAMES = {
  root: "blog-antd-skeleton",
  title: "blog-antd-skeleton__title",
  paragraph: "blog-antd-skeleton__paragraph",
} as const;

export const BLOG_ANTD_TOOLTIP_CLASSNAMES = {
  root: "blog-antd-tooltip",
  container: "blog-antd-tooltip__container",
  arrow: "blog-antd-tooltip__arrow",
} as const;
